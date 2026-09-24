import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { knowledgeApi } from '../api/client';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  BookMarked,
  UploadCloud,
  FileText,
  Trash2,
  Bot,
  Search,
  CheckCircle2,
  Database,
  Layers,
  Sparkles,
  Eye,
  Tag,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Clock,
  Cpu,
  FolderOpen,
  ArrowRight,
  FileCode,
  Loader2,
  HardDrive,
} from 'lucide-react';

export const KnowledgeBasePage = () => {
  const { documents, setDocuments } = useApp();
  const navigate = useNavigate();

  const [docsList, setDocsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  // Upload States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [selectedCategoryForUpload, setSelectedCategoryForUpload] = useState('Computer Science');
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Inspection & Action States
  const [previewDoc, setPreviewDoc] = useState(null);
  const [inspectData, setInspectData] = useState(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [reindexingDocId, setReindexingDocId] = useState(null);
  const [deletingDocId, setDeletingDocId] = useState(null);

  const categories = ['All', 'Computer Science', 'AI & Data Science', 'Networking', 'Database Systems', 'Uploaded Material'];

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await knowledgeApi.getDocuments({
        search: searchQuery,
        subject: selectedCategory,
      });
      setDocsList(data || []);
      if (setDocuments) setDocuments(data || []);
    } catch (e) {
      console.error('Error fetching knowledge documents:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [searchQuery, selectedCategory]);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const processUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(10);
    setUploadStage('Extracting text & page structures (pdfplumber)...');

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      // Simulated realistic stage transitions
      setTimeout(() => {
        setUploadStage('Executing semantic chunking & chapter boundary detection...');
        setUploadProgress(35);
      }, 400);

      setTimeout(() => {
        setUploadStage('Synthesizing 768-dim vectors via Gemini text-embedding-004...');
        setUploadProgress(70);
      }, 800);

      setTimeout(() => {
        setUploadStage('Registering sparse inverted index (BM25) & ChromaDB commit...');
        setUploadProgress(90);
      }, 1200);

      try {
        const newDoc = await knowledgeApi.uploadDocument(
          file,
          selectedCategoryForUpload,
          (progress) => setUploadProgress(progress)
        );

        setUploadProgress(100);
        setUploadStage('Indexing completed successfully!');
        setDocsList((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
      } catch (err) {
        console.error('Failed to upload doc:', err);
      }
    }

    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
      setSelectedFiles([]);
      setShowUploadModal(false);
      fetchDocuments();
    }, 800);
  };

  const handleReindex = async (e, docId) => {
    e.stopPropagation();
    setReindexingDocId(docId);
    try {
      const res = await knowledgeApi.reindexDocument(docId);
      setDocsList((prev) =>
        prev.map((d) =>
          d.id === docId
            ? { ...d, status: 'Indexed', vectorStatus: 'Indexed', chunksCount: res.chunks_count || d.chunksCount }
            : d
        )
      );
    } catch (err) {
      console.error('Re-index error:', err);
    } finally {
      setReindexingDocId(null);
    }
  };

  const handleDelete = async (e, docId) => {
    e.stopPropagation();
    if (window.confirm('Permanently delete this document and remove all vectors from ChromaDB and BM25?')) {
      setDeletingDocId(docId);
      try {
        await knowledgeApi.deleteDocument(docId);
        setDocsList((prev) => prev.filter((d) => d.id !== docId));
        if (previewDoc?.id === docId) {
          setPreviewDoc(null);
        }
      } catch (err) {
        console.error('Delete error:', err);
      } finally {
        setDeletingDocId(null);
      }
    }
  };

  const handleInspect = async (doc) => {
    setPreviewDoc(doc);
    setIsInspecting(true);
    try {
      const details = await knowledgeApi.getDocument(doc.id);
      setInspectData(details);
    } catch (e) {
      console.error('Error fetching doc detail:', e);
    } finally {
      setIsInspecting(false);
    }
  };

  const totalChunks = docsList.reduce((acc, d) => acc + (d.chunksCount || 0), 0);
  const totalEmbeddings = docsList.reduce((acc, d) => acc + (d.embeddingsCount || d.chunksCount || 0), 0);
  const totalPages = docsList.reduce((acc, d) => acc + (d.pagesCount || Math.max(1, Math.floor((d.chunksCount || 10) / 3))), 0);

  return (
    <DashboardLayout
      title="Knowledge Base & Document Index"
      subtitle="Enterprise Hybrid RAG pipeline with Semantic Chunking, ChromaDB Dense Vectors & BM25 Sparse Index"
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Vector DB Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-5 flex items-center justify-between border-brand-500/30">
            <div>
              <span className="text-xs text-slate-400 font-mono uppercase">Indexed Documents</span>
              <div className="text-2xl font-extrabold text-white font-display mt-1">{docsList.length} Files</div>
              <span className="text-[11px] text-brand-300 font-mono">{totalPages} Total Pages Extracted</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <BookMarked className="w-6 h-6" />
            </div>
          </GlassCard>

          <GlassCard className="p-5 flex items-center justify-between border-purple-500/30">
            <div>
              <span className="text-xs text-slate-400 font-mono uppercase">Semantic Chunks</span>
              <div className="text-2xl font-extrabold text-white font-display mt-1">{totalChunks} Chunks</div>
              <span className="text-[11px] text-purple-300 font-mono">Chapter & Section Metadata</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Layers className="w-6 h-6" />
            </div>
          </GlassCard>

          <GlassCard className="p-5 flex items-center justify-between border-cyan-500/30">
            <div>
              <span className="text-xs text-slate-400 font-mono uppercase">Vector Embeddings</span>
              <div className="text-2xl font-extrabold text-cyan-300 font-display mt-1">{totalEmbeddings} Vectors</div>
              <span className="text-[11px] text-cyan-400 font-mono">text-embedding-004 (768-D)</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
          </GlassCard>

          <GlassCard className="p-5 flex items-center justify-between border-emerald-500/30">
            <div>
              <span className="text-xs text-slate-400 font-mono uppercase">Hybrid Retrieval Engine</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-display mt-1 flex items-center gap-2">
                <span>Active</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <span className="text-[11px] text-emerald-300 font-mono">RRF + Cross-Encoder</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
          </GlassCard>
        </div>

        {/* Action Header & Upload Trigger */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents or tags..."
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowUploadModal(true)}
              leftIcon={UploadCloud}
            >
              Upload PDF Materials
            </Button>
          </div>
        </div>

        {/* Documents Grid */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 font-mono text-sm animate-pulse">
            Loading indexed documents from ChromaDB and SQLite...
          </div>
        ) : docsList.length === 0 ? (
          <GlassCard className="py-16 text-center space-y-3">
            <BookMarked className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-white font-display">No matching documents found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No notes match your filter. Upload PDF lecture slides or textbooks to build your grounded knowledge base.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowUploadModal(true)}
              className="mt-2"
            >
              Upload Document
            </Button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {docsList.map((doc) => {
              const isReindexing = reindexingDocId === doc.id;
              const isDeleting = deletingDocId === doc.id;
              const pagesCount = doc.pagesCount || Math.max(1, Math.floor((doc.chunksCount || 10) / 3));

              return (
                <GlassCard
                  key={doc.id}
                  hoverEffect
                  className={`p-6 flex flex-col justify-between group transition-all ${
                    isReindexing ? 'border-amber-500/50 bg-amber-500/5' : ''
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-slate-900 border border-brand-500/30 text-brand-400 group-hover:scale-105 transition-transform">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white font-display line-clamp-1">{doc.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                            <span className="text-brand-300 font-medium">{doc.category}</span>
                            <span>• {doc.fileSize}</span>
                            <span>• {doc.uploadedAt}</span>
                          </div>
                        </div>
                      </div>

                      <Badge variant={doc.status === 'Indexed' ? 'emerald' : 'amber'} size="sm" dot>
                        {doc.status || 'Indexed'}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {doc.summary || 'Indexed for grounding with dense vector search and sparse keyword retrieval.'}
                    </p>

                    {/* Metadata Telemetry Badges */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] font-mono text-slate-300">
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase block">Pages</span>
                        <span className="font-semibold text-white">{pagesCount} pgs</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase block">Chunks</span>
                        <span className="font-semibold text-brand-400">{doc.chunksCount} chunks</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase block">Embeddings</span>
                        <span className="font-semibold text-cyan-400">{doc.embeddingsCount || doc.chunksCount} vect</span>
                      </div>
                    </div>

                    {/* Semantic Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {doc.tags?.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-indigo-300 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{doc.embeddingModel || 'text-embedding-004'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Re-index Button */}
                      <button
                        onClick={(e) => handleReindex(e, doc.id)}
                        disabled={isReindexing}
                        className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                          isReindexing
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                        }`}
                        title="Re-index document (re-generate chunks and embeddings)"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isReindexing ? 'animate-spin text-amber-400' : ''}`} />
                        <span className="hidden sm:inline text-[11px]">{isReindexing ? 'Indexing...' : 'Re-index'}</span>
                      </button>

                      {/* Inspect Chunks Button */}
                      <button
                        onClick={() => handleInspect(doc)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Inspect chunks & summary"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Open in Workspace Button */}
                      <button
                        onClick={() => navigate(`/workspace?doc=${doc.id}`)}
                        className="px-2.5 py-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600/40 text-brand-300 border border-brand-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                        title="Open in AI Workspace"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Query</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDelete(e, doc.id)}
                        disabled={isDeleting}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Remove from vector store"
                      >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Multi-Document Upload Modal with Live Stepper */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          if (!isUploading) setShowUploadModal(false);
        }}
        title="Upload & Vector Index Course Material"
        subtitle="Extract text chunks with pdfplumber and generate ChromaDB vector embeddings."
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          {/* Category Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Subject / Category</label>
            <select
              value={selectedCategoryForUpload}
              onChange={(e) => setSelectedCategoryForUpload(e.target.value)}
              disabled={isUploading}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="Computer Science">Computer Science</option>
              <option value="AI & Data Science">AI & Data Science</option>
              <option value="Networking">Networking</option>
              <option value="Database Systems">Database Systems</option>
              <option value="Mathematics & Engineering">Mathematics & Engineering</option>
            </select>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-slate-700 hover:border-brand-500/80 rounded-2xl p-8 text-center bg-slate-900/50 transition-colors cursor-pointer relative"
          >
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.txt"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <UploadCloud className="w-10 h-10 text-brand-400 mx-auto mb-3 animate-bounce" />
            <p className="text-sm font-semibold text-white">Click or drag & drop PDF lecture notes here</p>
            <p className="text-xs text-slate-400 mt-1">Supports multi-file PDF, DOCX, TXT up to 50MB</p>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && !isUploading && (
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-300">Ready to Ingest ({selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}):</div>
              {selectedFiles.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-brand-400 shrink-0" />
                    <span className="truncate">{f.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{(f.size / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
              ))}
            </div>
          )}

          {/* Real-time Multi-Stage Progress Visualizer */}
          {isUploading && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-brand-300 font-semibold flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {uploadStage}
                </span>
                <span className="text-white font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>pdfplumber parser</span>
                <span>text-embedding-004</span>
                <span>BM25 + ChromaDB</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" size="sm" onClick={() => setShowUploadModal(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={processUpload}
              disabled={selectedFiles.length === 0 || isUploading}
              isLoading={isUploading}
              leftIcon={Sparkles}
            >
              Start Ingestion Pipeline
            </Button>
          </div>
        </div>
      </Modal>

      {/* Document Inspector Modal with Chunk Previews */}
      <Modal
        isOpen={!!previewDoc}
        onClose={() => {
          setPreviewDoc(null);
          setInspectData(null);
        }}
        title={previewDoc?.title || 'Document Inspector'}
        subtitle={`ChromaDB Collection Metadata • ${previewDoc?.chunksCount} Semantic Chunks • ${previewDoc?.pagesCount || 4} Pages`}
        maxWidth="max-w-3xl"
      >
        {previewDoc && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <h5 className="text-xs font-bold text-indigo-300 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5" />
                Document Summary & Scope
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed">{previewDoc.summary}</p>
            </div>

            {/* Technical Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Embedding</span>
                <p className="text-xs font-semibold text-white mt-1">text-embedding-004</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Chunk Count</span>
                <p className="text-xs font-semibold text-brand-400 mt-1">{previewDoc.chunksCount} Chunks</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Page Count</span>
                <p className="text-xs font-semibold text-cyan-400 mt-1">{previewDoc.pagesCount || 4} Pages</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Index Types</span>
                <p className="text-xs font-semibold text-emerald-400 mt-1">Dense + BM25</p>
              </div>
            </div>

            {/* Chunk Previews */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-brand-400" />
                  Extracted Semantic Chunks & Page Citations
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Sample Context</span>
              </div>

              {inspectData?.sample_chunks && inspectData.sample_chunks.length > 0 ? (
                <div className="space-y-2">
                  {inspectData.sample_chunks.map((chk, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span className="text-brand-300 font-semibold">{chk.chapter || 'Chapter 1'} • {chk.topic || 'Core'}</span>
                        <span className="text-cyan-400">Page {chk.page_number}</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">{chk.preview_text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                    <span className="text-brand-300 font-semibold">Chapter 1 • Foundation Concepts</span>
                    <span className="text-cyan-400">Page 1-4</span>
                  </div>
                  <p>{previewDoc.summary}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                leftIcon={RefreshCw}
                onClick={(e) => {
                  handleReindex(e, previewDoc.id);
                }}
              >
                Trigger Re-index
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const docId = previewDoc.id;
                  setPreviewDoc(null);
                  navigate(`/workspace?doc=${docId}`);
                }}
                leftIcon={Bot}
              >
                Open in AI Workspace
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

