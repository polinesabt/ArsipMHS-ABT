import { Database } from 'lucide-react';

export function InsightDataEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-muted-foreground">
      <Database className="w-12 h-12 mb-4 opacity-50" />
      <p className="font-medium text-foreground">Data belum tersedia</p>
      <p className="text-sm mt-1 max-w-sm">
        Sambungkan ke API/DB untuk menampilkan data.
      </p>
    </div>
  );
}
