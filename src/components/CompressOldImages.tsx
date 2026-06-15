import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/image-compression";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function CompressOldImages() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  const startCompression = async () => {
    try {
      setLoading(true);
      setProgress("Buscando fotos salvas...");
      const { data: attachments, error } = await supabase.from("activity_attachments").select("*");
      if (error) throw error;
      
      const toProcess = attachments || [];
      let compressedCount = 0;
      let skippedCount = 0;

      for (let i = 0; i < toProcess.length; i++) {
        const att = toProcess[i];
        setProgress(`Processando ${i + 1} de ${toProcess.length}...`);
        
        // Ignorar PDFs e outros arquivos
        if (att.storage_path.endsWith(".pdf") || att.storage_path.endsWith(".bin")) {
          skippedCount++;
          continue;
        }

        const { data: fileData, error: downloadError } = await supabase.storage.from("activity-attachments").download(att.storage_path);
        
        if (downloadError || !fileData) {
          skippedCount++;
          continue;
        }

        // Ignorar imagens pequenas (< 500KB)
        if (fileData.size < 500 * 1024) {
          skippedCount++;
          continue;
        }

        const fileName = att.storage_path.split('/').pop() || "image.jpg";
        let fileType = fileData.type;
        if (!fileType || fileType === "application/octet-stream") {
           if (fileName.toLowerCase().endsWith(".png")) fileType = "image/png";
           else fileType = "image/jpeg";
        }
        
        const file = new File([fileData], fileName, { type: fileType });
        const compressedFile = await compressImage(file);

        if (compressedFile.size < file.size) {
           const { error: uploadError } = await supabase.storage.from("activity-attachments").upload(att.storage_path, compressedFile, {
             upsert: true,
             contentType: compressedFile.type
           });
           if (!uploadError) {
             compressedCount++;
           } else {
             skippedCount++;
           }
        } else {
          skippedCount++;
        }
      }

      toast.success(`Concluído! ${compressedCount} imagens comprimidas.`);
    } catch (e: any) {
      toast.error(e.message || "Erro na compressão");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  return (
    <Card className="mt-8 border-orange-200 bg-orange-50/30">
      <CardHeader>
        <CardTitle className="text-orange-800">Ferramenta de Limpeza de Espaço</CardTitle>
        <CardDescription>
          Comprime as fotos antigas que já estão salvas no banco de dados para liberar espaço de armazenamento no Supabase. Não afeta a visualização nos relatórios. (Recomendado realizar via WiFi)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Button onClick={startCompression} disabled={loading} variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Comprimir Fotos Antigas
          </Button>
          {progress && <span className="text-sm font-medium text-orange-800">{progress}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
