'use client';

import React, { useState } from 'react';
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Camera,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type KYCStatus = 'not_started' | 'pending' | 'approved' | 'rejected';
type DocumentType = 'id_front' | 'id_back' | 'selfie' | 'proof_of_address';

interface Document {
  type: DocumentType;
  name: string;
  description: string;
  icon: React.ElementType;
  uploaded: boolean;
  fileName?: string;
}

interface KYCVerificationProps {
  currentStatus?: KYCStatus;
  onComplete?: () => void;
  onSkip?: () => void;
}

export function KYCVerification({ currentStatus = 'not_started', onComplete, onSkip }: KYCVerificationProps) {
  const [status, setStatus] = useState<KYCStatus>(currentStatus);
  const [documents, setDocuments] = useState<Document[]>([
    {
      type: 'id_front',
      name: 'ID Front',
      description: 'Front side of your government-issued ID',
      icon: FileText,
      uploaded: false,
    },
    {
      type: 'id_back',
      name: 'ID Back',
      description: 'Back side of your government-issued ID',
      icon: FileText,
      uploaded: false,
    },
    {
      type: 'selfie',
      name: 'Selfie with ID',
      description: 'A clear photo of yourself holding your ID',
      icon: Camera,
      uploaded: false,
    },
    {
      type: 'proof_of_address',
      name: 'Proof of Address',
      description: 'Utility bill or bank statement (last 3 months)',
      icon: FileText,
      uploaded: false,
    },
  ]);

  const uploadedCount = documents.filter(d => d.uploaded).length;
  const progress = (uploadedCount / documents.length) * 100;

  const handleFileUpload = (type: DocumentType, file: File) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.type === type
          ? { ...doc, uploaded: true, fileName: file.name }
          : doc
      )
    );
  };

  const handleSubmit = () => {
    setStatus('pending');
    // Simulate approval after 2 seconds for demo
    setTimeout(() => {
      setStatus('approved');
      onComplete?.();
    }, 2000);
  };

  const allUploaded = documents.every(d => d.uploaded);

  if (status === 'approved') {
    return (
      <Card className="card-shadow">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-[#00B8A9]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-[#00B8A9]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1A2B4A] mb-2">Verification Complete</h3>
            <p className="text-muted-foreground mb-6">
              Your identity has been verified. You now have full access to all features.
            </p>
            <Badge className="bg-[#00B8A9] text-white">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'pending') {
    return (
      <Card className="card-shadow">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-[#F6A623]/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-[#F6A623]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1A2B4A] mb-2">Verification In Progress</h3>
            <p className="text-muted-foreground mb-6">
              We're reviewing your documents. This usually takes 1-2 business days.
            </p>
            <Badge variant="outline" className="border-[#F6A623] text-[#F6A623]">
              <Clock className="h-3 w-3 mr-1" />
              Pending Review
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'rejected') {
    return (
      <Card className="card-shadow border-[#D63031]/20">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-[#D63031]/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-[#D63031]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1A2B4A] mb-2">Verification Failed</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't verify your documents. Please review the issues below and try again.
            </p>
            <div className="bg-[#D63031]/5 border border-[#D63031]/20 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-[#D63031] mt-0.5" />
                <div>
                  <p className="font-medium text-[#D63031]">Issues Found:</p>
                  <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
                    <li>ID photo is blurry or unclear</li>
                    <li>Selfie doesn't match ID photo</li>
                  </ul>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setStatus('not_started')}
              className="bg-[#1A2B4A] hover:bg-[#1A2B4A]/90"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-display text-[#1A2B4A]">
              Identity Verification
            </CardTitle>
            <CardDescription>
              Complete KYC to unlock all features and build trust with clients
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-[#F6A623] text-[#F6A623]">
            Required
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Upload Progress</span>
            <span className="font-medium text-[#1A2B4A]">{uploadedCount}/{documents.length} documents</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Benefits */}
        <div className="bg-[#00B8A9]/5 border border-[#00B8A9]/20 rounded-lg p-4">
          <h4 className="font-medium text-[#1A2B4A] mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#00B8A9]" />
            Why verify?
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Get a verified badge on your profile</li>
            <li>• Higher priority in matching algorithm</li>
            <li>• Access to premium project categories</li>
            <li>• Faster payment processing</li>
          </ul>
        </div>

        {/* Document Upload */}
        <div className="space-y-3">
          {documents.map((doc) => (
            <DocumentUploadItem
              key={doc.type}
              document={doc}
              onUpload={(file) => handleFileUpload(doc.type, file)}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {onSkip && (
            <Button variant="outline" onClick={onSkip}>
              Skip for now
            </Button>
          )}
          <Button
            className="flex-1 bg-[#1A2B4A] hover:bg-[#1A2B4A]/90"
            disabled={!allUploaded}
            onClick={handleSubmit}
          >
            Submit for Verification
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface DocumentUploadItemProps {
  document: Document;
  onUpload: (file: File) => void;
}

function DocumentUploadItem({ document, onUpload }: DocumentUploadItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  const Icon = document.icon;

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-4 transition-all",
        isDragging && "border-[#00B8A9] bg-[#00B8A9]/5",
        document.uploaded
          ? "border-[#00B8A9] bg-[#00B8A9]/5"
          : "border-border hover:border-[#00B8A9]/50"
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center",
          document.uploaded ? "bg-[#00B8A9] text-white" : "bg-muted text-muted-foreground"
        )}>
          {document.uploaded ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-[#1A2B4A]">{document.name}</h4>
          {document.uploaded ? (
            <p className="text-sm text-[#00B8A9] truncate">{document.fileName}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{document.description}</p>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          variant={document.uploaded ? "outline" : "secondary"}
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          {document.uploaded ? (
            <>
              <CheckCircle className="h-4 w-4 mr-1 text-[#00B8A9]" />
              Replace
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-1" />
              Upload
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
