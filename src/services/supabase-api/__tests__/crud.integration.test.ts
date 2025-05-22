import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { createCabinet, updateCabinet, getCabinetById, deleteCabinet } from '../cabinet';
import type { CabinetCreateInput } from '../cabinet/types';

// Mocker le client Supabase de manière plus complète
vi.mock('@/integrations/supabase/client', () => {
  const mockSelect = vi.fn().mockReturnThis();
  const mockInsert = vi.fn().mockReturnThis();
  const mockUpdate = vi.fn().mockReturnThis();
  const mockDelete = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();
  const mockSingle = vi.fn();
  
  return {
    supabase: {
      from: vi.fn(() => ({
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
        eq: mockEq,
        single: mockSingle,
      })),
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      single: mockSingle,
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
    const mockInsertResponse = { data: { id: 1, name: 'Test Cabinet' }, error: null };
    const mockUpdateResponse = { data: { id: 1, name: 'Updated Cabinet' }, error: null };
    const mockDeleteResponse = { data: {}, error: null };
    const mockSelectResponse = { data: { id: 1, name: 'Test Cabinet' }, error: null };
    
    // Configurer le comportement des mocks avec les arguments appropriés
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(mockInsertResponse)
      }),
      update: vi.fn().mockResolvedValue(mockUpdateResponse),
      delete: vi.fn().mockResolvedValue(mockDeleteResponse),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockSelectResponse)
        })
      })
    });
    
    (supabase.from as any) = mockFrom;
  });
  
  it('should create a new cabinet', async () => {
    const cabinetData: CabinetCreateInput = {
      name: 'Test Cabinet',
      address: '123 Test St',
      phone: '123-456-7890',
      email: 'test@example.com',
      imageUrl: null,
      logoUrl: null,
      osteopathId: 1,
      // Ajouter les champs optionnels supplémentaires requis par le type
      siret: null,
      city: null,
      postalCode: null,
      iban: null,
      bic: null,
      country: null
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
