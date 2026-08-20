/**
 * Job Search Service
 * Aggregates real live jobs from multiple free job boards:
 * - Arbeitnow (free, no key, large international + remote jobs)
 * - Remotive (free, no key, remote tech jobs)
 * - The Muse (free public API, company culture + jobs)
 * - JSearch via RapidAPI (optional, aggregates LinkedIn/Indeed/Glassdoor)
 */

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';

export interface LiveJob {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  remote: boolean;
  jobType: string;
  salary?: string;
  description: string;
  tags: string[];
  applyUrl: string;
  source: 'LinkedIn' | 'Indeed' | 'Glassdoor' | 'Remotive' | 'Arbeitnow' | 'TheMuse' | 'Naukri';
  sourceIcon: string;
  postedAt: string;
  postedDays: number;
  latitude?: number;
  longitude?: number;
}

export interface SearchOptions {
  query: string;
  location: string;
  type: string;
  remote: boolean;
  page: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysSince(dateStr: string): number {
  if (!dateStr) return 0;
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  } catch { return 0; }
}

function formatPosted(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return '1 month ago';
}

function extractTags(text: string, existingTags: string[] = []): string[] {
  const TECH_KEYWORDS = [
    'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Python', 'Django', 'FastAPI',
    'Java', 'Spring', 'Kotlin', 'Go', 'Rust', 'PHP', 'Laravel', 'Ruby', 'Rails',
    'TypeScript', 'JavaScript', 'GraphQL', 'REST', 'PostgreSQL', 'MySQL', 'MongoDB',
    'Redis', 'Kafka', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform',
    'PyTorch', 'TensorFlow', 'Machine Learning', 'AI', 'LLM', 'Figma', 'Swift',
    'React Native', 'Flutter', 'Solidity', 'Web3', 'Tailwind', 'SQL',
  ];
  const found = new Set<string>(existingTags);
  const combined = text.toLowerCase();
  for (const kw of TECH_KEYWORDS) {
    if (combined.includes(kw.toLowerCase())) found.add(kw);
  }
  return Array.from(found).slice(0, 6);
}

function isLocationMatch(jobLocation: string, requestedLocation: string, wantsRemote: boolean): boolean {
  if (!requestedLocation || requestedLocation.toLowerCase() === 'anywhere / remote') return true;
  const jLoc = (jobLocation || '').toLowerCase();
  const rLoc = requestedLocation.toLowerCase();

  // Direct substring
  if (jLoc.includes(rLoc)) return true;

  // Gujarat cities expansion
  const gujaratCities = ['ahmedabad', 'surat', 'vadodara', 'gandhinagar', 'rajkot', 'anand', 'bhavnagar', 'gujarat'];
  if (rLoc === 'gujarat' && gujaratCities.some(c => jLoc.includes(c))) return true;

  // Delhi NCR expansion
  const ncrKeywords = ['delhi', 'noida', 'gurugram', 'gurgaon', 'ghaziabad', 'faridabad', 'ncr'];
  if (ncrKeywords.some(k => rLoc.includes(k)) && ncrKeywords.some(k => jLoc.includes(k))) return true;

  // Any significant keyword match (e.g. "San Francisco" -> "San Francisco, CA")
  const parts = rLoc.split(/[\s,]+/).filter(p => p.length > 2 && !['and', 'the', 'city', 'area', 'ncr'].includes(p));
  if (parts.length > 0 && parts.some(p => jLoc.includes(p))) return true;

  // If remote was requested, allow wider matching
  if (wantsRemote) {
    if (jLoc.includes('worldwide') || jLoc.includes('anywhere') || jLoc.includes('global') || jLoc.includes('remote')) return true;
    const isIndiaCity = gujaratCities.concat(['bengaluru', 'mumbai', 'pune', 'hyderabad', 'delhi', 'chennai', 'kolkata']).includes(rLoc);
    if ((rLoc === 'india' || isIndiaCity) && (jLoc.includes('india') || jLoc.includes('asia') || jLoc.includes('apac'))) return true;
    if ((rLoc === 'united states' || rLoc === 'us' || rLoc === 'usa') && 
        (jLoc.includes('americas') || jLoc.includes('north america') || jLoc === 'us')) return true;
    if ((rLoc === 'united kingdom' || rLoc === 'uk') && 
        (jLoc.includes('europe') || jLoc.includes('emea') || jLoc === 'uk')) return true;
  }

  return false;
}

function isRoleMatch(jobTitle: string, query: string): boolean {
  if (!query) return true;
  const title = jobTitle.toLowerCase();
  const q = query.toLowerCase();

  if (title.includes(q) || q.includes(title)) return true;

  // Generic words that shouldn't independently match a role
  const genericWords = new Set(['developer', 'engineer', 'manager', 'designer', 'lead', 'senior', 'junior', 'remote', 'software', 'contractor', 'assistant', 'intern', 'analyst', 'specialist', 'associate', 'expert']);
  
  // Extract core keywords from query
  const qTerms = q.split(/[\s/,]+/).filter(t => t.length > 1 && !genericWords.has(t));
  
  // If the query was entirely generic (e.g. "software engineer"), accept all returned
  if (qTerms.length === 0) return true; 
  
  // The job title contains at least one of the core terms
  return qTerms.some(term => title.includes(term));
}

// ─── Source: Arbeitnow (free, no API key, large listing) ──────────────────────

async function fetchArbeitnow(opts: SearchOptions): Promise<LiveJob[]> {
  try {
    const params = new URLSearchParams({
      search: opts.query,
      ...(opts.remote ? { remote: 'true' } : {}),
      page: String(opts.page || 1),
    });
    const res = await fetch(`https://www.arbeitnow.com/api/job-board-api?${params}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || [])
      .filter((j: any) => {
        if (!isLocationMatch(j.location || 'Remote', opts.location, !!opts.remote)) return false;
        return true;
      })
      .map((j: any) => ({
        id: `arb-${j.slug}`,
        title: j.title,
        company: j.company_name,
        companyLogo: j.company_logo,
        location: j.location || 'Remote',
        remote: j.remote || false,
        jobType: j.job_types?.[0] || 'Full-time',
        salary: '',
        description: j.description ? j.description.replace(/<[^>]*>/g, '').slice(0, 300) + '...' : '',
        tags: extractTags(j.description || '', j.tags || []),
        applyUrl: j.url,
        source: 'Arbeitnow' as const,
        sourceIcon: '🌐',
        postedAt: j.created_at,
        postedDays: daysSince(j.created_at),
      }));
  } catch (e) {
    console.warn('Arbeitnow fetch failed:', e);
    return [];
  }
}

// ─── Source: Remotive (free, no key, remote tech jobs) ────────────────────────

async function fetchRemotive(opts: SearchOptions): Promise<LiveJob[]> {
  try {
    const params = new URLSearchParams({ search: opts.query, limit: '25' });
    const res = await fetch(`https://remotive.com/api/remote-jobs?${params}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.jobs || [])
      .filter((j: any) => {
        if (!isLocationMatch(j.candidate_required_location || 'Remote', opts.location, !!opts.remote)) return false;
        return true;
      })
      .map((j: any) => ({
        id: `rem-${j.id}`,
        title: j.title,
        company: j.company_name,
        companyLogo: j.company_logo,
        location: j.candidate_required_location || 'Remote',
        remote: true,
        jobType: j.job_type || 'Full-time',
        salary: j.salary || '',
        description: j.description ? j.description.replace(/<[^>]*>/g, '').slice(0, 300) + '...' : '',
        tags: extractTags(j.description || '', j.tags || []),
        applyUrl: j.url,
        source: 'Remotive' as const,
        sourceIcon: '🏠',
        postedAt: j.publication_date,
        postedDays: daysSince(j.publication_date),
      }));
  } catch (e) {
    console.warn('Remotive fetch failed:', e);
    return [];
  }
}

// ─── Source: JSearch via RapidAPI (aggregates LinkedIn, Indeed, Glassdoor) ────

async function fetchJSearch(opts: SearchOptions): Promise<LiveJob[]> {
  if (!RAPIDAPI_KEY) return [];
  try {
    const query = opts.location ? `${opts.query} in ${opts.location}` : opts.query;
    const params = new URLSearchParams({
      query,
      page: String(opts.page || 1),
      num_pages: '1',
      date_posted: 'month',
      ...(opts.remote ? { remote_jobs_only: 'true' } : {}),
    });
    const res = await fetch(`https://jsearch.p.rapidapi.com/search?${params}`, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || [])
      .filter((j: any) => {
        const fullLocation = j.job_city && j.job_country ? `${j.job_city}, ${j.job_country}` : (j.job_country || 'Remote');
        if (!isLocationMatch(fullLocation, opts.location, !!opts.remote)) return false;
        return true;
      })
      .map((j: any) => {
        const source = j.job_publisher?.toLowerCase().includes('linkedin') ? 'LinkedIn'
          : j.job_publisher?.toLowerCase().includes('glassdoor') ? 'Glassdoor'
          : 'Indeed';
        return {
          id: `jsc-${j.job_id}`,
          title: j.job_title,
          company: j.employer_name,
          companyLogo: j.employer_logo,
          location: j.job_city && j.job_country ? `${j.job_city}, ${j.job_country}` : (j.job_country || 'Remote'),
          remote: j.job_is_remote || false,
          jobType: j.job_employment_type || 'Full-time',
          salary: j.job_min_salary && j.job_max_salary
            ? `$${Math.round(j.job_min_salary / 1000)}k – $${Math.round(j.job_max_salary / 1000)}k`
            : '',
          description: (j.job_description || '').slice(0, 300) + '...',
          tags: extractTags(j.job_description || ''),
          applyUrl: j.job_apply_link || j.job_google_link,
          source: source as LiveJob['source'],
          sourceIcon: source === 'LinkedIn' ? '💼' : source === 'Glassdoor' ? '🚪' : '📋',
          postedAt: j.job_posted_at_datetime_utc || '',
          postedDays: j.job_posted_at_datetime_utc ? daysSince(j.job_posted_at_datetime_utc) : 0,
          latitude: j.job_latitude,
          longitude: j.job_longitude,
        };
      });
  } catch (e) {
    console.warn('JSearch fetch failed:', e);
    return [];
  }
}

// ─── Source: LinkedIn Public (free, live, local + remote jobs) ───────────────

async function fetchLinkedInPublic(opts: SearchOptions): Promise<LiveJob[]> {
  try {
    const params = new URLSearchParams({
      keywords: opts.query,
      location: opts.location || 'India',
    });
    
    if (opts.remote) {
      params.append('f_WT', '2'); // LinkedIn remote filter
    }

    const res = await fetch(`https://www.linkedin.com/jobs/search?${params}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(10000),
    });
    
    if (!res.ok) return [];
    const html = await res.text();
    
    const cardRegex = /<div class="base-card[\s\S]*?<\/li>/gi;
    const rawCards = html.match(cardRegex) || [];
    const jobs: LiveJob[] = [];

    for (const card of rawCards) {
      // Title
      const titleMatch = card.match(/<h3[^>]*class="[^"]*base-search-card__title[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/h3>/i);
      const title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim() : '';

      // Company
      const companyMatch = card.match(/<h4[^>]*class="[^"]*base-search-card__subtitle[^"]*"[^>]*>[\s\S]*?<a[^>]*>\s*([\s\S]*?)\s*<\/a>[\s\S]*?<\/h4>/i)
        || card.match(/<h4[^>]*class="[^"]*base-search-card__subtitle[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/h4>/i);
      const company = companyMatch ? companyMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim() : '';

      // Location
      const locMatch = card.match(/<span[^>]*class="[^"]*job-search-card__location[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/span>/i);
      const loc = locMatch ? locMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim() : (opts.location || 'India');

      // Date
      const dateMatch = card.match(/<time[^>]*datetime="([^"]*)"/i);
      const dateStr = dateMatch ? dateMatch[1].trim() : new Date().toISOString().split('T')[0];

      // Apply URL
      const linkMatch = card.match(/<a[^>]*class="[^"]*base-card__full-link[^"]*"[^>]*href="([^"]*)"/i)
        || card.match(/<a[^>]*href="([^"]*linkedin\.com\/jobs\/view\/[^"]*)"/i);
      const rawLink = linkMatch ? linkMatch[1].replace(/&amp;/g, '&') : '';
      const applyUrl = rawLink ? rawLink.split('?')[0].trim() : `https://www.linkedin.com/jobs/search?${params}`;

      // Company Logo
      const logoMatch = card.match(/<img[^>]*class="[^"]*artdeco-entity-image[^"]*"[^>]*data-delayed-url="([^"]*)"/i)
        || card.match(/<img[^>]*class="[^"]*artdeco-entity-image[^"]*"[^>]*src="([^"]*)"/i);
      const companyLogo = logoMatch ? logoMatch[1].replace(/&amp;/g, '&') : undefined;

      const jobId = applyUrl.split('-').pop() || `li-${Date.now()}-${jobs.length}`;

      if (title) {
        jobs.push({
          id: `li-${jobId}`,
          title,
          company: company || 'Top Hiring Company',
          companyLogo,
          location: loc,
          remote: opts.remote || loc.toLowerCase().includes('remote'),
          jobType: 'Full-time',
          description: `Apply for ${title} at ${company || 'top company'} in ${loc}. View complete job requirements and submit your application on LinkedIn.`,
          tags: extractTags(title + ' ' + (company || '')),
          applyUrl,
          source: 'LinkedIn' as const,
          sourceIcon: '💼',
          postedAt: dateStr,
          postedDays: daysSince(dateStr),
        });
      }
    }
    
    return jobs.filter(j => isLocationMatch(j.location, opts.location, !!opts.remote));

  } catch (e) {
    console.warn('LinkedIn public fetch failed:', e);
    return [];
  }
}

// ─── Main aggregator ───────────────────────────────────────────────────────────

class JobSearchService {
  async search(opts: SearchOptions): Promise<LiveJob[]> {
    // Fire all sources in parallel
    const [arbeitnow, remotive, jsearch, linkedin] = await Promise.allSettled([
      fetchArbeitnow(opts),
      fetchRemotive(opts),
      fetchJSearch(opts),
      fetchLinkedInPublic(opts),
    ]);

    const all: LiveJob[] = [
      ...(linkedin.status === 'fulfilled' ? linkedin.value : []),
      ...(arbeitnow.status === 'fulfilled' ? arbeitnow.value : []),
      ...(remotive.status === 'fulfilled' ? remotive.value : []),
      ...(jsearch.status === 'fulfilled' ? jsearch.value : []),
    ];

    // De-duplicate by title+company
    const seen = new Set<string>();
    const unique = all.filter(j => {
      const key = `${j.title.toLowerCase().replace(/[^a-z0-9]/g, '')}-${j.company.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort: freshest first
    return unique.sort((a, b) => a.postedDays - b.postedDays);
  }
}

export const jobSearchService = new JobSearchService();
