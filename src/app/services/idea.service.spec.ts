import { TestBed } from '@angular/core/testing';
import { IDEA_MAX_LENGTH, IdeaService, cleanIdea, ideaInitial } from './idea.service';

describe('cleanIdea', () => {
  it('collapses inner whitespace and trims the ends', () => {
    expect(cleanIdea('  Bloom \n  for   plants ')).toBe('Bloom for plants');
  });

  it('caps the name at the maximum length, counting characters rather than UTF-16 units', () => {
    const long = 'a'.repeat(40);
    expect(cleanIdea(long).length).toBe(IDEA_MAX_LENGTH);
    expect(Array.from(cleanIdea('🌱'.repeat(30))).length).toBe(IDEA_MAX_LENGTH);
  });

  it('treats null and undefined as no name', () => {
    expect(cleanIdea(null)).toBe('');
    expect(cleanIdea(undefined)).toBe('');
  });
});

describe('ideaInitial', () => {
  it('upper-cases the first letter, Cyrillic included', () => {
    expect(ideaInitial('bloom')).toBe('B');
    expect(ideaInitial('квітка')).toBe('К');
  });

  it('returns an empty string for an empty name', () => {
    expect(ideaInitial('   ')).toBe('');
  });
});

describe('IdeaService', () => {
  beforeEach(() => {
    localStorage.removeItem('idea');
    TestBed.configureTestingModule({});
  });

  afterEach(() => localStorage.removeItem('idea'));

  it('starts unnamed and remembers a cleaned name', () => {
    const service = TestBed.inject(IdeaService);
    expect(service.hasName()).toBeFalse();

    service.set('  Bloom  ');

    expect(service.name()).toBe('Bloom');
    expect(service.hasName()).toBeTrue();
    expect(localStorage.getItem('idea')).toBe('Bloom');
  });

  it('forgets the stored name when it is cleared', () => {
    const service = TestBed.inject(IdeaService);
    service.set('Bloom');
    service.set('');

    expect(service.name()).toBe('');
    expect(localStorage.getItem('idea')).toBeNull();
  });
});
