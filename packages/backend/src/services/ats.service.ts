import { aiService } from './ai.service';
import { AppError } from '../middleware/errorHandler';

export class ATSService {
  async analyze(resumeText: string, jobDescription?: string) {
    if (!resumeText || resumeText.length < 50) {
      throw new AppError(400, 'INVALID_RESUME', 'Resume text is too short or empty');
    }

    const result = await aiService.analyzeATS(resumeText, jobDescription);
    try {
      const cleanJson = result.replace(/^```json/m, '').replace(/```$/m, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.error('Failed to parse AI response:', result);
      throw new AppError(500, 'AI_PARSE_ERROR', 'Failed to parse AI response');
    }
  }

  async enhance(resumeText: string, jobDescription?: string, atsIssues?: any) {
    if (!resumeText || resumeText.length < 50) {
      throw new AppError(400, 'INVALID_RESUME', 'Resume text is too short or empty');
    }

    const result = await aiService.enhanceResumeForATS(resumeText, jobDescription, atsIssues);
    try {
      const cleanJson = result.replace(/^```json/m, '').replace(/```$/m, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.error('Failed to parse AI enhance response:', result);
      throw new AppError(500, 'AI_PARSE_ERROR', 'Failed to parse AI response');
    }
  }

  async extractTextFromBuffer(buffer: Buffer, mimeType: string, originalName?: string): Promise<string> {
    const isPdfByMagic = buffer.length > 4 && buffer.toString('utf-8', 0, 5) === '%PDF-';
    const isPdfByNameOrMime = mimeType?.includes('pdf') || originalName?.toLowerCase().endsWith('.pdf');

    if (isPdfByMagic || isPdfByNameOrMime) {
      return this.extractPDFText(buffer, mimeType || 'application/pdf');
    }

    if (mimeType?.includes('wordprocessingml.document') || originalName?.toLowerCase().endsWith('.docx')) {
      return this.extractDOCXText(buffer);
    }

    return buffer.toString('utf-8');
  }

  private async extractPDFText(buffer: Buffer, mimeType: string): Promise<string> {
    let text = '';
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      if (data.text && data.text.trim().length > 50) {
        return data.text;
      }
    } catch (err) {
      console.warn('pdf-parse failed, falling back to Gemini Vision...');
    }

    // Fallback to Gemini Vision for image-based PDFs
    text = await aiService.extractTextFromPDF(buffer, mimeType);
    if (!text || text.trim().length < 20) {
      throw new AppError(422, 'PARSE_ERROR', 'Failed to extract text from PDF. Ensure the file contains readable content.');
    }
    return text;
  }

  private async extractDOCXText(buffer: Buffer): Promise<string> {
    try {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch {
      throw new AppError(422, 'PARSE_ERROR', 'Failed to parse DOCX file.');
    }
  }
}

export const atsService = new ATSService();
