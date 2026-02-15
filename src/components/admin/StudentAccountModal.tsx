/**
 * Student Account Modal
 * Admin form to create new student accounts with NIM + password
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { StudentStatus, StudentAccountInput } from '@/types/student.types';

interface StudentAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StudentAccountInput) => Promise<{ success: boolean; error?: string }>;
  existingNims: string[];
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

const statusOptions: { value: StudentStatus; label: string }[] = [
  { value: 'active', label: 'Mahasiswa Aktif' },
  { value: 'alumni', label: 'Alumni' },
  { value: 'on_leave', label: 'Cuti' },
  { value: 'dropout', label: 'Dropout' },
];

export function StudentAccountModal({ open, onOpenChange, onSubmit, existingNims }: StudentAccountModalProps) {
  const [formData, setFormData] = useState({
    nim: '',
    nama: '',
    password: '',
    confirmPassword: '',
    email: '',
    noHp: '',
    status: 'active' as StudentStatus,
    tahunMasuk: currentYear,
    tahunLulus: undefined as number | undefined,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // NIM validation
    if (!formData.nim.trim()) {
      newErrors.nim = 'NIM wajib diisi';
    } else if (!/^[0-9.]+$/.test(formData.nim)) {
      newErrors.nim = 'NIM hanya boleh berisi angka dan titik';
    } else if (formData.nim.length < 4) {
      newErrors.nim = 'NIM minimal 4 karakter';
    } else if (formData.nim.length > 20) {
      newErrors.nim = 'NIM maksimal 20 karakter';
    } else if (existingNims.includes(formData.nim)) {
      newErrors.nim = 'NIM sudah terdaftar';
    }
    
    // Nama validation
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama wajib diisi';
    } else if (formData.nama.length < 3) {
      newErrors.nama = 'Nama minimal 3 karakter';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    
    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak cocok';
    }
    
    // Year validation
    if (formData.status === 'alumni' && !formData.tahunLulus) {
      newErrors.tahunLulus = 'Tahun lulus wajib diisi untuk alumni';
    }
    
    if (formData.tahunLulus && formData.tahunLulus < formData.tahunMasuk) {
      newErrors.tahunLulus = 'Tahun lulus tidak boleh sebelum tahun masuk';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitResult(null);
    
    try {
      const result = await onSubmit({
        nim: formData.nim,
        nama: formData.nama,
        password: formData.password,
        email: formData.email || undefined,
        noHp: formData.noHp || undefined,
        status: formData.status,
        tahunMasuk: formData.tahunMasuk,
        tahunLulus: formData.tahunLulus,
      });
      
      if (result.success) {
        setSubmitResult({ success: true, message: 'Akun mahasiswa berhasil dibuat!' });
        // Reset form after success
        setTimeout(() => {
          resetForm();
          onOpenChange(false);
        }, 1500);
      } else {
        setSubmitResult({ success: false, message: result.error || 'Gagal membuat akun' });
      }
    } catch (error) {
      setSubmitResult({ success: false, message: 'Terjadi kesalahan sistem' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nim: '',
      nama: '',
      password: '',
      confirmPassword: '',
      email: '',
      noHp: '',
      status: 'active',
      tahunMasuk: currentYear,
      tahunLulus: undefined,
    });
    setErrors({});
    setSubmitResult(null);
    setIsSubmitting(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    } else {
      setIsSubmitting(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            Tambah Akun Mahasiswa
          </DialogTitle>
          <DialogDescription>
            Buat akun login baru dengan NIM sebagai username
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* NIM */}
          <div className="space-y-2">
            <Label htmlFor="nim">NIM (Username) *</Label>
            <Input
              id="nim"
              placeholder="Contoh: 4.51.23.0.17"
              value={formData.nim}
              onChange={(e) => {
                const raw = e.target.value;
                const value = raw.replace(/[^0-9.]/g, '').slice(0, 20);
                setFormData({ ...formData, nim: value });
              }}
              className={errors.nim ? 'border-destructive' : ''}
            />
            {errors.nim && <p className="text-xs text-destructive">{errors.nim}</p>}
          </div>

          {/* Nama */}
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Lengkap *</Label>
            <Input
              id="nama"
              placeholder="Masukkan nama lengkap"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className={errors.nama ? 'border-destructive' : ''}
            />
            {errors.nama && <p className="text-xs text-destructive">{errors.nama}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password *</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ulangi password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={errors.confirmPassword ? 'border-destructive' : ''}
            />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="noHp">No. HP</Label>
              <Input
                id="noHp"
                placeholder="08xxxxxxxxxx"
                value={formData.noHp}
                onChange={(e) => setFormData({ ...formData, noHp: e.target.value.replace(/\D/g, '').slice(0, 13) })}
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status Mahasiswa *</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => setFormData({ ...formData, status: v as StudentStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tahun Masuk & Lulus */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tahun Masuk *</Label>
              <Select
                value={formData.tahunMasuk.toString()}
                onValueChange={(v) => setFormData({ ...formData, tahunMasuk: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tahun Lulus {formData.status === 'alumni' && '*'}</Label>
              <Select
                value={formData.tahunLulus?.toString() || ''}
                onValueChange={(v) => setFormData({ ...formData, tahunLulus: v ? parseInt(v) : undefined })}
              >
                <SelectTrigger className={errors.tahunLulus ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tahunLulus && <p className="text-xs text-destructive">{errors.tahunLulus}</p>}
            </div>
          </div>

          {/* Submit Result */}
          {submitResult && (
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              submitResult.success 
                ? 'bg-success/10 text-success' 
                : 'bg-destructive/10 text-destructive'
            }`}>
              {submitResult.success ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{submitResult.message}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
              type="button"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitting}
              type="button"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Akun'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
