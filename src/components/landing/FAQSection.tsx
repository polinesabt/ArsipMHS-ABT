import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'Siapa saja yang bisa mengisi data di Arsip Mahasiswa Prodi ABT?',
    answer: 'Arsip Mahasiswa Prodi ABT dapat diakses oleh mahasiswa dan alumni Program Studi Administrasi Bisnis Terapan (ABT) Politeknik Negeri Semarang. Sistem akan mencocokkan data Anda dengan database master sebelum mengizinkan pengisian form.',
  },
  {
    question: 'Apa saja data yang dicatat di Arsip Mahasiswa Prodi ABT?',
    answer: 'Arsip Mahasiswa Prodi ABT mencakup profil mahasiswa, riwayat karir (khusus alumni), dan prestasi non-akademik seperti partisipasi kegiatan, karya ilmiah, HAKI, pengalaman magang, wirausaha, dan program pengembangan diri.',
  },
  {
    question: 'Apakah data saya aman?',
    answer: 'Ya, keamanan data adalah prioritas kami. Seluruh data disimpan dengan enkripsi dan hanya dapat diakses oleh admin yang berwenang untuk keperluan akreditasi dan analisis statistik program studi.',
  },
  {
    question: 'Bagaimana jika nama saya tidak ditemukan di sistem?',
    answer: 'Jika nama Anda tidak ditemukan, silakan gunakan tombol "Laporkan ke Admin" untuk melaporkan masalah ini. Tim kami akan memverifikasi dan menambahkan data Anda ke database master.',
  },
  {
    question: 'Berapa lama waktu yang dibutuhkan untuk mengisi form?',
    answer: 'Form dirancang dengan konsep kuesioner interaktif yang engaging. Pengisian data dasar hanya membutuhkan 3-5 menit. Untuk prestasi non-akademik, waktu tergantung jumlah data yang diinput.',
  },
  {
    question: 'Apakah saya bisa mengupdate data di kemudian hari?',
    answer: 'Tentu! Anda dapat mengupdate data status karir dan menambah prestasi kapan saja. Sistem menyimpan timeline riwayat untuk tracking perkembangan karir Anda.',
  },
  {
    question: 'Apa kegunaan AI Insight?',
    answer: 'AI Insight adalah fitur analisis cerdas yang menghasilkan laporan naratif otomatis berdasarkan data alumni. Fitur ini membantu admin dalam pembuatan laporan akreditasi dan pengambilan keputusan strategis.',
  },
];

export function FAQSection() {
  return (
    <section className="py-24 bg-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-warning/10 text-warning text-sm font-medium mb-4">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pertanyaan Umum
            </h2>
            <p className="text-lg text-muted-foreground">
              Temukan jawaban untuk pertanyaan yang sering diajukan tentang Arsip Mahasiswa Prodi ABT.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-background border border-border rounded-xl px-6 data-[state=open]:shadow-soft data-[state=open]:border-primary/20 transition-all duration-200"
              >
                <AccordionTrigger className="text-left text-foreground hover:no-underline py-5 font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
