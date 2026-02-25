import { useState, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { parseMETARFile } from '../utils/metarParser';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Card, CardContent } from './ui/card';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export function METARUpload() {
  const { setMetarData, setIsProcessing, setProcessingProgress, isProcessing, processingProgress, metarData } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setSuccess(false);
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const text = await file.text();
      setProcessingProgress(30);

      const parsed = parseMETARFile(text);
      setProcessingProgress(80);

      if (parsed.length === 0) {
        setError('No valid METAR records found. Make sure the file contains Dutch airport METARs (EHAM, EHGG, EHLE, EHJK, EHWO).');
        setIsProcessing(false);
        return;
      }

      setMetarData(parsed);
      setProcessingProgress(100);
      setSuccess(true);
    } catch (err) {
      setError('Failed to parse file: ' + String(err));
    } finally {
      setIsProcessing(false);
    }
  }, [setMetarData, setIsProcessing, setProcessingProgress]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const airports = ['EHAM', 'EHGG', 'EHLE', 'EHJK', 'EHWO'];
  const countsByAirport = airports.map((icao) => ({
    icao,
    count: metarData.filter((m) => m.icao === icao).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">METAR Upload</h1>
        <p className="text-gray-500 mt-1">Upload a metar_data.txt file to begin analysis</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              'border-2 border-dashed rounded-lg p-12 text-center transition-colors',
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            )}
          >
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">
              Drag and drop your METAR file here
            </p>
            <p className="text-sm text-gray-500 mt-1">or</p>
            <label className="mt-4 inline-block cursor-pointer">
              <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                <FileText className="h-4 w-4 mr-2" />
                Browse File
              </span>
              <input type="file" accept=".txt" className="hidden" onChange={handleFileChange} />
            </label>
            <p className="text-xs text-gray-400 mt-4">Supported: metar_data.txt</p>
          </div>

          {isProcessing && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Processing...</span>
                <span>{processingProgress}%</span>
              </div>
              <Progress value={processingProgress} />
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2 p-4 bg-red-50 rounded-lg text-red-700">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 flex items-center gap-2 p-4 bg-green-50 rounded-lg text-green-700">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">Successfully parsed {metarData.length} METAR records.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {metarData.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Data Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {countsByAirport.map(({ icao, count }) => (
                <div key={icao} className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="font-bold text-lg text-slate-800">{icao}</p>
                  <p className="text-2xl font-semibold text-blue-600">{count}</p>
                  <p className="text-xs text-gray-500">records</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-sm text-gray-600">Total records:</span>
              <span className="font-semibold text-gray-900">{metarData.length}</span>
            </div>
            <div className="mt-1 flex justify-between items-center">
              <span className="text-sm text-gray-600">Date range:</span>
              <span className="text-sm text-gray-900">
                {metarData.length > 0
                  ? `${metarData[0].datetime.toISOString().slice(0, 10)} – ${metarData[metarData.length - 1].datetime.toISOString().slice(0, 10)}`
                  : '—'}
              </span>
            </div>
            <div className="mt-4 pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => { setMetarData([]); setSuccess(false); }}>
                Clear Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
