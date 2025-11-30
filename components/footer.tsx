export default function Footer() {
  return (
    <footer 
      className="border-t bg-card mt-20"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-3">MXShare</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Your trusted platform for sharing educational resources. Learn together, grow together.
            </p>
            <div className="flex gap-3 text-2xl">
              <span>📚</span>
              <span>🔗</span>
              <span>🎓</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/dashboard" className="hover:text-primary transition">Dashboard</a></li>
              <li><a href="/upload" className="hover:text-primary transition">Upload Notes</a></li>
              <li><a href="/my-files" className="hover:text-primary transition">My Files</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3">Connect</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>📧 25MXians</li>
              <li>🌐 PSG Tech</li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 text-center text-sm text-muted-foreground" style={{ borderColor: "var(--border)" }}>
          <p>© 2025 MXShare. Built with ❤️ by Nitheesh, Sabarish & Dhakhana</p>
        </div>
      </div>
    </footer>
  );
}
