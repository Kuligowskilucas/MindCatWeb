'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useToast } from '@/components/ui/Toast';
import { dataExportApi } from '@/lib/api/dataExport';
import { ApiError } from '@/lib/http';

export function DataExportCard() {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  async function download() {
    setError(undefined);
    setSubmitting(true);
    try {
      const data = await dataExportApi.export(password || undefined);

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mindcat-meus-dados.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setPassword('');
      toast.success('Download iniciado. Guarde o arquivo com cuidado.');
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError('Senha do diário incorreta.');
      } else {
        toast.error(
          err instanceof ApiError ? err.message : 'Não foi possível exportar.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Baixar meus dados"
        description="Exporte uma cópia dos seus dados (perfil, humores, tarefas e diário) em um arquivo JSON."
      />
      <CardBody className="space-y-4">
        <p className="text-sm text-ink-soft">
          Se você usa o diário, informe a senha dele para incluir as entradas
          decifradas. O arquivo conterá seu diário em texto legível, então
          guarde-o com cuidado.
        </p>

        <PasswordInput
          label="Senha do diário (opcional)"
          autoComplete="off"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          disabled={submitting}
        />

        <Button onClick={download} disabled={submitting}>
          {submitting ? 'Preparando…' : 'Baixar meus dados'}
        </Button>
      </CardBody>
    </Card>
  );
}
