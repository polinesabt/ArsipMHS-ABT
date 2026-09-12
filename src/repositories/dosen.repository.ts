/**
 * Dosen Repository
 * Handles direct fetching and syncing with the MySQL Database via /backend/api/dosen/data.php
 */

import { apiClient, ApiResponse } from '@/lib/api-client';
import type { DosenItem } from '@/data/mockDosenData';
import type { KontribusiDosenItem } from '@/data/mockKontribusiDosenData';
import type { KontribusiPenelitianDosenItem } from '@/data/mockPenelitianDosenData';
import type { KontribusiPengabdianDosenItem } from '@/data/mockPengabdianDosenData';
import type { WaktuMengajarItem } from '@/data/mockWaktuMengajarData';
import type { DosenLuaranItem } from '@/data/mockLuaranPenelitianPkmData';
import type { TenagaKependidikanItem } from '@/data/mockTenagaKependidikanData';
import type { ArchivedDosenItem } from '@/contexts/DosenContext';

export interface DosenAllDataResponse {
  dosenList: DosenItem[];
  kontribusiPengajaranList: KontribusiDosenItem[];
  kontribusiPenelitianList: KontribusiPenelitianDosenItem[];
  kontribusiPengabdianList: KontribusiPengabdianDosenItem[];
  waktuMengajarList: WaktuMengajarItem[];
  luaranList: DosenLuaranItem[];
  tendikList: TenagaKependidikanItem[];
  archivedDosenList: ArchivedDosenItem[];
}

export class DosenRepository {
  /**
   * Fetch all SSOT data directly from MySQL database
   */
  async getAllDosenData(): Promise<ApiResponse<DosenAllDataResponse>> {
    try {
      const response = await apiClient.get<DosenAllDataResponse>('dosen/data.php');
      return response;
    } catch (error) {
      console.error('Error fetching dosen data from database:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown database error',
      };
    }
  }

  /**
   * Ping / Sync Dosen data back to database
   */
  async syncDosenData(action: string, data: unknown, nidn?: string): Promise<ApiResponse<{ action: string }>> {
    try {
      const response = await apiClient.post<{ action: string }>('dosen/save.php', {
        action,
        nidn,
        data,
      });
      return response;
    } catch (error) {
      console.error('Error syncing dosen data to database:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      };
    }
  }
}

export const dosenRepository = new DosenRepository();
