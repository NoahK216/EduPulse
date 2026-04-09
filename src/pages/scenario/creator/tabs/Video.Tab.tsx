import { useState } from "react";
import type { VideoNode } from "../../nodeSchemas";
import { useEditorDispatch } from "../editor-store/EditorDispatchContext";
import { TextInputDispatch } from "./NodeDispatchFields";
import type { NodeTabProps } from "./TabRenderer";
import {
  labelClassName,
  panelInputClassName,
  sectionClassName,
  sectionHeaderClassName,
} from "./tabStyles";

export function VideoTab({ node }: NodeTabProps<VideoNode>) {
  const dispatch = useEditorDispatch();
  const [videoMode, setVideoMode] = useState<'upload' | 'youtube' | 'url'>(
    node.srcType === 'youtube' ? 'youtube' : node.srcType === 'file' ? 'upload' : 'url'
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      setUploadError('Please select a valid video file');
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setUploadError('Video file is too large (max 500 MB)');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch('/api/public/videos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await response.json();
      
      dispatch({
        type: 'updateNode',
        id: node.id,
        patch: {
          type: 'video',
          src: data.url,
          srcType: 'file',
          uploadedAt: data.uploadedAt,
        },
      });
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Upload failed'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleYoutubeValidation = async (url: string) => {
    if (!url.trim()) {
      setYoutubeError(null);
      return;
    }

    setYoutubeError(null);

    try {
      const response = await fetch('/api/public/videos/validate-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        setYoutubeError(error.message || 'Invalid YouTube URL');
        return;
      }

      const data = await response.json();
      
      dispatch({
        type: 'updateNode',
        id: node.id,
        patch: {
          type: 'video',
          src: url,
          srcType: 'youtube',
          youtubeId: data.youtubeId,
        },
      });
    } catch (error) {
      setYoutubeError(
        error instanceof Error ? error.message : 'Validation failed'
      );
    }
  };

  return (
    <>
      <section className={sectionClassName}>
        <p className={sectionHeaderClassName}>Video Setup</p>
        <label className={labelClassName}>Title</label>
        <TextInputDispatch
          node={node}
          path="title"
          className={panelInputClassName}
          placeholder="Video title"
        />

        <label className={`${labelClassName} mt-6`}>Video Source</label>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setVideoMode('upload')}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition ${
              videoMode === 'upload'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => setVideoMode('youtube')}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition ${
              videoMode === 'youtube'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            YouTube URL
          </button>
          <button
            onClick={() => setVideoMode('url')}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition ${
              videoMode === 'url'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            Direct URL
          </button>
        </div>

        {videoMode === 'upload' && (
          <div>
            <label className="block border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition">
              <input
                type="file"
                accept="video/*"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isUploading ? (
                  <>
                    <div className="inline-block animate-spin">⏳</div> Uploading...
                  </>
                ) : (
                  <>
                    <p className="font-medium">Click to select video or drag and drop</p>
                    <p className="text-xs mt-1">Max 500 MB</p>
                  </>
                )}
              </div>
            </label>
            {uploadError && (
              <p className="text-sm text-red-500 mt-2">{uploadError}</p>
            )}
            {node.src && node.srcType === 'file' && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                ✓ Video uploaded
              </p>
            )}
          </div>
        )}

        {videoMode === 'youtube' && (
          <div>
            <input
              type="text"
              defaultValue={node.srcType === 'youtube' ? node.src : ''}
              placeholder="https://youtube.com/watch?v=... or youtu.be/..."
              className={panelInputClassName}
              onBlur={(e) => handleYoutubeValidation(e.target.value)}
            />
            {youtubeError && (
              <p className="text-sm text-red-500 mt-2">{youtubeError}</p>
            )}
            {node.src && node.srcType === 'youtube' && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                ✓ YouTube URL validated
              </p>
            )}
          </div>
        )}

        {videoMode === 'url' && (
          <div>
            <TextInputDispatch
              node={node}
              path="src"
              className={panelInputClassName}
              placeholder="https://... (direct video URL)"
            />
          </div>
        )}

        <label className={`${labelClassName} mt-4`}>Captions URL</label>
        <TextInputDispatch
          node={node}
          path="captionsSrc"
          className={panelInputClassName}
          placeholder="https://... (VTT or SRT file)"
        />
      </section>

      <section className={sectionClassName}>
        <p className={sectionHeaderClassName}>Playback</p>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 border-slate-300 bg-slate-100 dark:border-slate-700/70 dark:bg-slate-900/35">
          <input
            type="checkbox"
            checked={Boolean(node.autoplay)}
            className="h-4 w-4 rounded text-sky-500 focus:ring-2 focus:ring-sky-400/40 border-slate-400 bg-white dark:border-slate-500 dark:bg-slate-900"
            onChange={(e) =>
              dispatch({
                type: "updateNode",
                id: node.id,
                patch: {
                  type: "video",
                  autoplay: e.target.checked,
                },
              })
            }
          />
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              Autoplay video
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Starts playback when this node becomes active.
            </p>
          </div>
        </label>
      </section>
    </>
  );
}
