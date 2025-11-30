"use client";

import { useState } from "react";

interface ShareButtonProps {
  fileId: string;
  title?: string;
}

export default function ShareButton({ fileId, title = "Check out this resource" }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

  const url = typeof window !== "undefined" ? `${window.location.origin}/file/${fileId}` : "";
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const showNotification = (message: string) => {
    const notification = document.createElement('div');
    notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#7c3aed;color:#fff;padding:12px 18px;border-radius:10px;z-index:9999;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.15);';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => { 
      notification.style.opacity = '0'; 
      notification.style.transition = 'opacity 0.3s'; 
      setTimeout(() => notification.remove(), 300); 
    }, 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    showNotification('✓ Link copied to clipboard');
    setShowMenu(false);
  };

  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodedTitle}%0A${encodedUrl}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setShowMenu(false);
  };

  const handleLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
    setShowMenu(false);
  };

  const handleGoogleClassroom = () => {
    const classroomUrl = `https://classroom.google.com/share?url=${encodedUrl}&title=${encodedTitle}`;
    window.open(classroomUrl, '_blank', 'noopener,noreferrer');
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium shadow-sm flex items-center justify-center gap-2"
      >
        🔗 Share
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div 
            className="absolute right-0 mt-2 w-64 bg-card border rounded-lg shadow-xl z-50 overflow-hidden"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="p-2 space-y-1">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-md transition text-left"
                style={{ color: "var(--card-foreground)" }}
              >
                <span className="text-xl">📋</span>
                <div>
                  <div className="font-medium">Copy Link</div>
                  <div className="text-xs text-muted-foreground">Copy URL to clipboard</div>
                </div>
              </button>

              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-md transition text-left"
                style={{ color: "var(--card-foreground)" }}
              >
                <span className="text-xl">💬</span>
                <div>
                  <div className="font-medium">WhatsApp</div>
                  <div className="text-xs text-muted-foreground">Share via WhatsApp</div>
                </div>
              </button>

              <button
                onClick={handleLinkedIn}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-md transition text-left"
                style={{ color: "var(--card-foreground)" }}
              >
                <span className="text-xl">💼</span>
                <div>
                  <div className="font-medium">LinkedIn</div>
                  <div className="text-xs text-muted-foreground">Share on LinkedIn</div>
                </div>
              </button>

              <button
                onClick={handleGoogleClassroom}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-md transition text-left"
                style={{ color: "var(--card-foreground)" }}
              >
                <span className="text-xl">🎓</span>
                <div>
                  <div className="font-medium">Google Classroom</div>
                  <div className="text-xs text-muted-foreground">Share to Classroom</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
