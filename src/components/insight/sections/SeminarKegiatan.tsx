import { Publications } from '@/components/insight/sections/Publications';

// Backward compatibility section. Navigasi utama sudah memakai modul tunggal "Diseminasi Ilmiah Mahasiswa".
export function SeminarKegiatan() {
  return <Publications activeTab="seminar" />;
}
