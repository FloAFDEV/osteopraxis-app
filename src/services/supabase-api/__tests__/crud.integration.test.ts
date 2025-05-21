
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { createCabinet, updateCabinet, getCabinetById, deleteCabinet } from '../cabinet';
import type { CabinetCreateInput } from '../cabinet/types';

// Mocker le client Supabase
vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      single: vi.fn(),
      execute: vi.fn()
    }
  };
});

describe('Cabinet CRUD Operations', () => {
  let mockInsertResponse: any;
  let mockUpdateResponse: any;
  let mockDeleteResponse: any;
  let mockSelectResponse: any;
  
  beforeEach(() => {
    // Réinitialiser les mocks
    vi.resetAllMocks();
    
    // Configurer les réponses simulées
    mockInsertResponse = { data: { id: 1, name: 'Test Cabinet' }, error: null };
    mockUpdateResponse = { data: { id: 1, name: 'Updated Cabinet' }, error: null };
    mockDeleteResponse = { data: {}, error: null };
    mockSelectResponse = { data: { id: 1, name: 'Test Cabinet' }, error: null };
    
    // Configurer le comportement des mocks
    (supabase.from('Cabinet').insert as any).mockReturnValue({ select: vi.fn().mockResolvedValue(mockInsertResponse) });
    (supabase.from('Cabinet').update as any).mockResolvedValue(mockUpdateResponse);
    (supabase.from('Cabinet').delete as any).mockResolvedValue(mockDeleteResponse);
    (supabase.from('Cabinet').select as any).mockReturnThis();
    (supabase.from('Cabinet').select().eq as any).mockReturnThis();
    (supabase.from('Cabinet').select().eq().single as any).mockResolvedValue(mockSelectResponse);
  });

  it('should create a new cabinet', async () => {
    const cabinetData: CabinetCreateInput = {
      name: 'Test Cabinet',
      address: '123 Test St',
      phone: '123-456-7890',
      email: 'test@example.com',
      imageUrl: null,
      logoUrl: null,
      osteopathId: 1
    };
    
    const result = await createCabinet(cabinetData);
    
    expect(supabase.from).toHaveBeenCalledWith('Cabinet');
    expect(result).toEqual({ id: 1, name: 'Test Cabinet' });
  });

  it('should update an existing cabinet', async () => {
    const result = await updateCabinet(1, { name: 'Updated Cabinet' });
    
    expect(supabase.from).toHaveBeenCalledWith('Cabinet');
    expect(result).toEqual({ id: 1, name: 'Updated Cabinet' });
  });

  it('should get a cabinet by ID', async () => {
    const result = await getCabinetById(1);
    
    expect(supabase.from).toHaveBeenCalledWith('Cabinet');
    expect(result).toEqual({ id: 1, name: 'Test Cabinet' });
  });

  it('should delete a cabinet', async () => {
    const result = await deleteCabinet(1);
    
    expect(supabase.from).toHaveBeenCalledWith('Cabinet');
    expect(result).toEqual(true);
  });
});
