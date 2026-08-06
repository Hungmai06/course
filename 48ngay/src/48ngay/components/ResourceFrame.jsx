import { useState, useEffect, useRef } from 'react'
import { parseDriveLink } from '../utils/parseDriveLink'

const IFRAME_TIMEOUT_MS = 8000

// Detect mobile/tablet: these devices commonly block 3rd-party cookies
// which causes Google Drive private iframes to fail silently.
// Desktop browsers (Chrome, Firefox, Edge) generally allow them.
function isMobileDevice() {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(
    navigator.userAgent
  )
}

// Icons
const DriveIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2L2 19h20L12 2z" fill="#4285F4" opacity=".85"/>
    <path d="M2 19h8l-4-7L2 19z" fill="#0F9D58" opacity=".9"/>
    <path d="M22 19h-8l4-7 4 7z" fill="#F4B400" opacity=".9"/>
  </svg>
)

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z"/>
  </svg>
)

const FileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
  </svg>
)

function FallbackCard({ openUrl, isVideo, isMobile }) {
  return (
    <div className="iframe-fallback-card">
      <div className="iframe-fallback-icon">
        <DriveIcon />
      </div>
      <div className="iframe-fallback-body">
        <p className="iframe-fallback-title">
          {isVideo ? 'Xem video bài học' : 'Mở tài liệu bài học'}
        </p>
        {isMobile && (
          <p className="iframe-fallback-desc">
            Trên điện thoại / máy tính bảng, nhấn nút bên dưới để mở trực tiếp
            trên Google Drive — nhanh hơn và xem được đầy đủ hơn.
          </p>
        )}
        <a
          href={openUrl}
          target="_blank"
          rel="noreferrer"
          className="iframe-fallback-btn"
          id={isVideo ? 'open-video-drive' : 'open-doc-drive'}
        >
          {isVideo ? <PlayIcon /> : <FileIcon />}
          {isVideo ? 'Xem video trên Google Drive' : 'Mở tài liệu trên Google Drive'}
          <span className="iframe-fallback-arrow">↗</span>
        </a>
      </div>
    </div>
  )
}

function ResourceFrame({ title, link }) {
  const parsedLink = parseDriveLink(link)
  const previewLink = parsedLink.embedUrl

  // On mobile: skip iframe entirely — show fallback immediately
  // On desktop: try iframe, fall back after timeout if it fails
  const mobile = isMobileDevice()

  // status: 'loading' | 'loaded' | 'fallback'
  const [status, setStatus] = useState(mobile ? 'fallback' : 'loading')
  const timerRef = useRef(null)

  useEffect(() => {
    if (mobile) {
      setStatus('fallback')
      return
    }

    setStatus('loading')
    if (!previewLink) return

    timerRef.current = setTimeout(() => {
      setStatus((prev) => (prev === 'loading' ? 'fallback' : prev))
    }, IFRAME_TIMEOUT_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [previewLink, mobile])

  function handleIframeLoad() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setStatus('loaded')
  }

  if (!previewLink) {
    return <p className="empty-state">Tài nguyên đang được cập nhật.</p>
  }

  const isVideo = String(title || '').toLowerCase().includes('video')
  const isFolder = parsedLink.type === 'folder'

  return (
    <div className="resource-frame">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <p className="resource-title !m-0">{title}</p>
        {!isFolder && (
          <a
            href={parsedLink.openUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-all"
            id={isVideo ? 'open-video-top-link' : 'open-doc-top-link'}
          >
            <DriveIcon />
            Mở tab mới ↗
          </a>
        )}
      </div>

      {/* Folder: always redirect (never embeds reliably) */}
      {isFolder && (
        <FallbackCard openUrl={parsedLink.openUrl} isVideo={false} isMobile={mobile} />
      )}

      {/* Mobile: skip iframe, show redirect card immediately */}
      {!isFolder && mobile && (
        <FallbackCard openUrl={parsedLink.openUrl} isVideo={isVideo} isMobile={true} />
      )}

      {/* Desktop only below this point */}
      {!isFolder && !mobile && (
        <>
          {/* Loading shimmer bar */}
          {status === 'loading' && (
            <div className="iframe-loading-bar" aria-label="Đang tải..." />
          )}

          {/* Desktop fallback: iframe timed out (rare — ad-blocker, strict cookies) */}
          {status === 'fallback' && (
            <FallbackCard openUrl={parsedLink.openUrl} isVideo={isVideo} isMobile={false} />
          )}

          {/* Iframe — always rendered so onLoad can fire; hidden when fallback */}
          {isVideo ? (
            <div
              className="embed-16by9"
              style={status === 'fallback' ? { display: 'none' } : {}}
            >
              <iframe
                key={previewLink}
                title={title}
                src={previewLink}
                className="resource-iframe"
                scrolling="no"
                allow="autoplay; encrypted-media; fullscreen"
                onLoad={handleIframeLoad}
              />
            </div>
          ) : (
            <iframe
              key={previewLink}
              title={title}
              src={previewLink}
              className="resource-iframe"
              scrolling="yes"
              allow="autoplay"
              style={status === 'fallback' ? { display: 'none' } : {}}
              onLoad={handleIframeLoad}
            />
          )}

          {/* Convenience external link below a successfully loaded iframe */}
          {status === 'loaded' && (
            <a
              href={parsedLink.openUrl}
              target="_blank"
              rel="noreferrer"
              className="iframe-open-link"
              id={isVideo ? 'open-video-external' : 'open-doc-external'}
            >
              <DriveIcon />
              Mở trên Google Drive ↗
            </a>
          )}
        </>
      )}
    </div>
  )
}

export default ResourceFrame
