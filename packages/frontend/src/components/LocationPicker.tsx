import React, { useState, useMemo } from 'react';
import { State, City } from 'country-state-city';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Navigation } from 'lucide-react';

interface LocationPickerProps {
  onLocationSelect: (location: string) => void;
  defaultLocation?: string;
}

export function LocationPicker({ onLocationSelect, defaultLocation = 'Anywhere / Remote' }: LocationPickerProps) {
  const [selectedStateCode, setSelectedStateCode] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  
  // All Indian States
  const states = useMemo(() => State.getStatesOfCountry('IN'), []);
  
  // Cities for the selected state
  const cities = useMemo(() => {
    if (!selectedStateCode) return [];
    // Remove duplicate cities by name
    const rawCities = City.getCitiesOfState('IN', selectedStateCode);
    const unique = [];
    const seen = new Set();
    for (const c of rawCities) {
      if (!seen.has(c.name)) {
        seen.add(c.name);
        unique.push(c);
      }
    }
    return unique;
  }, [selectedStateCode]);

  const isAnywhere = !selectedStateCode && !selectedCity && defaultLocation === 'Anywhere / Remote';

  const handleStateChange = (code: string) => {
    if (code === 'ANYWHERE') {
      setSelectedStateCode('');
      setSelectedCity('');
      onLocationSelect('Anywhere / Remote');
      return;
    }
    setSelectedStateCode(code);
    setSelectedCity('');
    
    const stateName = states.find(s => s.isoCode === code)?.name || '';
    onLocationSelect(stateName);
  };

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    onLocationSelect(cityName);
  };

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      <Select value={isAnywhere ? 'ANYWHERE' : selectedStateCode} onValueChange={handleStateChange}>
        <SelectTrigger className="h-12 rounded-xl border-2 border-border font-medium">
          <MapPin className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
          <SelectValue placeholder="Select State..." />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <SelectItem value="ANYWHERE">Anywhere / Remote</SelectItem>
          {states.map(s => (
            <SelectItem key={s.isoCode} value={s.isoCode}>{s.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={selectedCity} 
        onValueChange={handleCityChange} 
        disabled={!selectedStateCode || selectedStateCode === 'ANYWHERE'}
      >
        <SelectTrigger className="h-12 rounded-xl border-2 border-border font-medium bg-background">
          <Navigation className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
          <SelectValue placeholder="Select City..." />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {cities.map(c => (
            <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
