import { supabase } from '@/integrations/supabase/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { supabaseCabinetService } from '../cabinet';
import { CabinetCreateInput, CabinetUpdateInput } from '../cabinet/types';
import { getCurrentOsteopathId } from '../utils/getCurrentOsteopath';

// Mock the getCurrentOsteopathId function
vi.mock('../utils/getCurrentOsteopath', () => ({
  getCurrentOsteopathId: vi.fn(),
}));

describe('Supabase Cabinet Service CRUD Operations', () => {
  const testOsteopathId = 999; // Use a test osteopath ID
  let testCabinetId: number | undefined;

  beforeAll(async () => {
    // Set up the mock to return the test osteopath ID
    (getCurrentOsteopathId as Mock).mockResolvedValue(testOsteopathId);
  });

  afterAll(async () => {
    // Clean up: Delete the test cabinet if it exists
    if (testCabinetId) {
      try {
        await supabaseCabinetService.deleteCabinet(testCabinetId);
        console.log(`[TEST] Cleaned up cabinet with ID ${testCabinetId}`);
      } catch (error) {
        console.error(`[TEST] Error cleaning up cabinet with ID ${testCabinetId}:`, error);
      }
    }
  });

  it('should create a new cabinet', async () => {
    const newCabinetData: CabinetCreateInput = {
      name: 'Test Cabinet',
      address: '123 Test Street',
      phone: '123-456-7890',
      email: 'test@example.com',
      imageUrl: null,
      logoUrl: null,
      osteopathId: testOsteopathId,
    };

    const createdCabinet = await supabaseCabinetService.createCabinet(newCabinetData);

    expect(createdCabinet).toBeDefined();
    expect(createdCabinet.name).toBe(newCabinetData.name);
    expect(createdCabinet.address).toBe(newCabinetData.address);
    expect(createdCabinet.osteopathId).toBe(testOsteopathId);

    // Store the ID for later tests and cleanup
    testCabinetId = createdCabinet.id;
  }, 10000);

  it('should get a cabinet by ID', async () => {
    if (!testCabinetId) {
      throw new Error('No cabinet ID available. Create cabinet test must run first.');
    }

    const cabinet = await supabaseCabinetService.getCabinetById(testCabinetId);

    expect(cabinet).toBeDefined();
    expect(cabinet?.id).toBe(testCabinetId);
    expect(cabinet?.osteopathId).toBe(testOsteopathId);
  });

  it('should get cabinets by osteopath ID', async () => {
    const cabinets = await supabaseCabinetService.getCabinetsByOsteopathId(testOsteopathId);

    expect(cabinets).toBeDefined();
    expect(Array.isArray(cabinets)).toBe(true);
    cabinets.forEach(cabinet => {
      expect(cabinet.osteopathId).toBe(testOsteopathId);
    });
  });

  it('should update an existing cabinet', async () => {
    if (!testCabinetId) {
      throw new Error('No cabinet ID available. Create cabinet test must run first.');
    }

    const updateData: CabinetUpdateInput = {
      name: 'Updated Test Cabinet',
      address: '456 Updated Street',
    };

    const updatedCabinet = await supabaseCabinetService.updateCabinet(testCabinetId, updateData);

    expect(updatedCabinet).toBeDefined();
    expect(updatedCabinet?.id).toBe(testCabinetId);
    expect(updatedCabinet?.name).toBe(updateData.name);
    expect(updatedCabinet?.address).toBe(updateData.address);
  });

  it('should delete a cabinet', async () => {
    if (!testCabinetId) {
      throw new Error('No cabinet ID available. Create cabinet test must run first.');
    }

    const deleteResult = await supabaseCabinetService.deleteCabinet(testCabinetId);
    expect(deleteResult).toBe(true);

    // Verify that the cabinet is actually deleted
    const cabinet = await supabaseCabinetService.getCabinetById(testCabinetId);
    expect(cabinet).toBeUndefined();

    // Clear the testCabinetId to prevent further operations on a deleted cabinet
    testCabinetId = undefined;
  });
});
