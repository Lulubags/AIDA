import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Grade, Subject } from "@/lib/types";

interface CurriculumUploadProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  grade?: Grade;
  subject?: Subject;
  description?: string;
}

export function CurriculumUpload({ isOpen, onClose }: CurriculumUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported format. Please use PDF, DOC, DOCX, or TXT files.`,
          variant: "destructive"
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB. Please use smaller files.`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one curriculum document to upload.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedGrade || !selectedSubject) {
      toast({
        title: "Missing information",
        description: "Please select both grade and subject for the curriculum documents.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });
      formData.append('grade', selectedGrade);
      formData.append('subject', selectedSubject);
      formData.append('description', description);

      const response = await fetch('/api/curriculum/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      setUploadedDocs(prev => [...prev, ...result.documents]);
      setSelectedFiles([]);
      setDescription("");
      
      toast({
        title: "Upload successful",
        description: `Successfully uploaded ${selectedFiles.length} curriculum document(s).`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload curriculum documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Upload School Curriculum</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How to Upload School Curriculum</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Upload PDF, DOC, DOCX, or TXT files containing curriculum content</li>
              <li>• Maximum file size: 10MB per document</li>
              <li>• Specify grade level and subject for each upload</li>
              <li>• The AI will use these documents to provide curriculum-specific responses</li>
              <li>• Documents are processed and stored securely for your school</li>
            </ul>
          </div>

          {/* Grade and Subject Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Grade Level</Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                    <SelectItem key={grade} value={grade.toString()}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="afrikaans">Afrikaans</SelectItem>
                  <SelectItem value="natural-sciences">Natural Sciences</SelectItem>
                  <SelectItem value="social-sciences">Social Sciences</SelectItem>
                  <SelectItem value="life-orientation">Life Orientation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Description (Optional)</Label>
            <Textarea
              placeholder="Describe these curriculum documents (e.g., 'Grade 5 Mathematics Term 1 Curriculum')"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-20"
            />
          </div>

          {/* File Upload Area */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Curriculum Documents</Label>
            <div 
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                PDF, DOC, DOCX, TXT files up to 10MB each
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Selected Files</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Documents */}
          {uploadedDocs.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Successfully Uploaded</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {uploadedDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center space-x-3 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{doc.name}</p>
                      <p className="text-xs text-gray-500">Grade {doc.grade} • {doc.subject}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            
            <Button 
              onClick={handleUpload} 
              disabled={isUploading || selectedFiles.length === 0}
              className="flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Upload Documents</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}