import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAlumni } from '@/contexts/AlumniContext';
import { StatCard } from '@/components/shared';
import {
  Sparkles, TrendingUp, Users, Briefcase, Rocket,
  ArrowLeft, Loader2, Copy, Check, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export default function AIInsightPage() {
  const { alumniData, masterData } = useAlumni();
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateInsights = () => {
    setIsGenerating(true);

    // Simulate AI analysis
    setTimeout(() => {
      const bekerja = alumniData.filter(d => d.status === 'bekerja');
      const wirausaha = alumniData.filter(d => d.status === 'wirausaha');
      const studi = alumniData.filter(d => d.status === 'studi');
      const mencari = alumniData.filter(d => d.status === 'mencari');

      // Calculate percentages
      const total = alumniData.length;
      const bekerjaPercent = total ? Math.round((bekerja.length / total) * 100) : 0;
      const wirausahaPercent = total ? Math.round((wirausaha.length / total) * 100) : 0;

      // Industry analysis
      const industryCount: Record<string, number> = {};
      bekerja.forEach(d => {
        if (d.bidangIndustri) {
          industryCount[d.bidangIndustri] = (industryCount[d.bidangIndustri] || 0) + 1;
        }
      });
      const topIndustry = Object.entries(industryCount).sort((a, b) => b[1] - a[1])[0];

      // Location analysis
      const locationCount: Record<string, number> = {};
      bekerja.forEach(d => {
        if (d.lokasiPerusahaan) {
          locationCount[d.lokasiPerusahaan] = (locationCount[d.lokasiPerusahaan] || 0) + 1;
        }
      });
      const topLocation = Object.entries(locationCount).sort((a, b) => b[1] - a[1])[0];

      // Jurusan analysis
      const jurusanBekerja: Record<string, number> = {};
      bekerja.forEach(d => {
        const master = masterData.find(m => m.id === d.alumniMasterId);
        if (master) {
          jurusanBekerja[master.jurusan] = (jurusanBekerja[master.jurusan] || 0) + 1;
        }
      });
      const topJurusan = Object.entries(jurusanBekerja).sort((a, b) => b[1] - a[1])[0];

      const generatedInsights = [
        `## Tingkat Keterserapan Kerja\n\nDari total ${total} alumni yang telah tercatat di Arsip Mahasiswa Prodi ABT, sebanyak **${bekerjaPercent}%** saat ini berstatus bekerja. Angka ini menunjukkan tingkat employability yang ${bekerjaPercent >= 70 ? 'sangat baik dan sejalan dengan target program studi' : bekerjaPercent >= 50 ? 'cukup baik namun masih perlu ditingkatkan' : 'perlu perhatian khusus dari pihak program studi'}.`,

        `## Tren Kewirausahaan\n\nSebanyak **${wirausahaPercent}%** alumni memilih jalur wirausaha. ${wirausahaPercent >= 20 ? 'Ini menunjukkan jiwa entrepreneurship yang tinggi di kalangan alumni ABT Polines, selaras dengan kurikulum yang menekankan kewirausahaan.' : 'Kampus dapat mempertimbangkan penguatan program inkubasi bisnis dan mentoring kewirausahaan untuk meningkatkan minat berwirausaha di kalangan mahasiswa.'}`,

        topIndustry ? `## Industri Dominan\n\nSektor **${topIndustry[0]}** menjadi pilihan terbanyak dengan ${topIndustry[1]} alumni. Hal ini menunjukkan kesesuaian kurikulum ABT dengan kebutuhan industri tersebut dan dapat menjadi acuan untuk penguatan mata kuliah terkait.` : '',

        topLocation ? `## Persebaran Lokasi Kerja\n\n**${topLocation[0]}** menjadi lokasi kerja terfavorit dengan ${topLocation[1]} alumni. Data ini dapat menjadi acuan untuk program kerjasama industri dan penempatan magang mahasiswa.` : '',

        topJurusan ? `## Analisis Per Jurusan\n\nAlumni dari jurusan **${topJurusan[0]}** menunjukkan tingkat keterserapan kerja tertinggi dengan ${topJurusan[1]} alumni bekerja. Best practice dari jurusan ini dapat diterapkan ke jurusan lainnya.` : '',

        studi.length > 0 ? `## Minat Studi Lanjut\n\nTerdapat **${studi.length} alumni** yang melanjutkan pendidikan ke jenjang yang lebih tinggi. Ini menunjukkan komitmen untuk pengembangan akademik dan dapat menjadi indikator positif untuk akreditasi program studi.` : '',

        mencari.length > 0 ? `## Alumni Mencari Kerja\n\nSaat ini terdapat **${mencari.length} alumni** yang sedang aktif mencari pekerjaan. Program studi dapat membantu melalui program job fair, career counseling, atau menghubungkan dengan mitra industri.` : '',

        `## Rekomendasi Strategis\n\nBerdasarkan analisis data Arsip Mahasiswa Prodi ABT, disarankan untuk:\n1. Memperkuat kerjasama dengan industri ${topIndustry?.[0] || 'unggulan'}\n2. Mengembangkan program magang yang lebih intensif\n3. Menyelenggarakan alumni networking secara berkala\n4. Meningkatkan pelatihan soft skill dan sertifikasi kompetensi`,
      ].filter(Boolean);

      setInsights(generatedInsights);
      setIsGenerating(false);
    }, 2500);
  };

  const handleCopyInsight = (insight: string, index: number) => {
    // Remove markdown formatting for plain text copy
    const plainText = insight.replace(/##\s*/g, '').replace(/\*\*/g, '').replace(/\n\n/g, '\n');
    navigator.clipboard.writeText(plainText);
    setCopiedIndex(index);
    toast({ title: 'Disalin ke clipboard' });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    const allText = insights.map(i => i.replace(/##\s*/g, '').replace(/\*\*/g, '').replace(/\n\n/g, '\n')).join('\n\n---\n\n');
    navigator.clipboard.writeText(allText);
    toast({ title: 'Semua insight disalin ke clipboard' });
  };

  // Stats
  const stats = {
    total: alumniData.length,
    bekerja: alumniData.filter(d => d.status === 'bekerja').length,
    wirausaha: alumniData.filter(d => d.status === 'wirausaha').length,
    tingkatKerja: alumniData.length ? Math.round((alumniData.filter(d => d.status === 'bekerja').length / alumniData.length) * 100) : 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-12 sm:pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8 animate-fade-up">
              <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Dashboard
              </Link>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary to-info flex items-center justify-center shadow-glow">
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Insight</h1>
                  <p className="text-muted-foreground">Analisis cerdas data alumni secara otomatis.</p>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-up">
              <StatCard title="Data Dianalisis" value={stats.total} icon={Users} color="primary" animate={false} />
              <StatCard title="Bekerja" value={stats.bekerja} icon={Briefcase} color="primary" animate={false} />
              <StatCard title="Wirausaha" value={stats.wirausaha} icon={Rocket} color="success" animate={false} />
              <StatCard title="Tingkat Kerja" value={`${stats.tingkatKerja}%`} icon={TrendingUp} color="info" animate={false} />
            </div>

            {/* Generate Button */}
            {insights.length === 0 && (
              <div className="glass-card rounded-2xl p-6 sm:p-10 text-center mb-8 animate-fade-up">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-info/20 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Siap Menganalisis Data Alumni</h2>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                  Sistem akan menganalisis seluruh data alumni dan menghasilkan insight dalam format
                  laporan naratif yang siap digunakan untuk kebutuhan akreditasi dan pelaporan.
                </p>
                <Button onClick={generateInsights} disabled={isGenerating} size="lg" className="px-8">
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Menganalisis Data...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Insight
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Insights */}
            {insights.length > 0 && (
              <div className="space-y-4 animate-fade-up">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Hasil Analisis</h2>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyAll}>
                      <Copy className="w-4 h-4 mr-2" />
                      Salin Semua
                    </Button>
                    <Button variant="outline" size="sm" onClick={generateInsights} disabled={isGenerating}>
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span className="ml-2">Regenerate</span>
                    </Button>
                  </div>
                </div>

                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className="glass-card rounded-xl p-6 animate-fade-up group relative"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleCopyInsight(insight, index)}
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <div className="prose prose-sm max-w-none text-foreground">
                      {insight.split('\n').map((line, i) => {
                        if (line.startsWith('## ')) {
                          return <h3 key={i} className="text-lg font-semibold text-foreground mb-3 mt-0">{line.replace('## ', '')}</h3>;
                        }
                        if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
                          return <p key={i} className="text-muted-foreground mb-1 ml-4">{line}</p>;
                        }
                        return (
                          <p key={i} className="text-muted-foreground mb-2">
                            {line.split('**').map((part, j) =>
                              j % 2 === 1 ? <strong key={j} className="text-foreground">{part}</strong> : part
                            )}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* AI Note */}
                <div className="glass-card rounded-xl p-5 bg-primary/5 border-primary/20 mt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">Catatan Penggunaan</p>
                      <p className="text-sm text-muted-foreground">
                        Insight ini dihasilkan berdasarkan data yang tersedia saat ini di Arsip Mahasiswa Prodi ABT.
                        Untuk hasil yang lebih akurat, pastikan lebih banyak alumni telah melengkapi data pada sistem arsip.
                        Konten dapat langsung disalin dan digunakan untuk keperluan pelaporan akreditasi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
