import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold mb-6">
          Build Together, Ship Faster
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          The Wove is a collaborative development platform designed for AI-assisted developers.
          Build, learn, and grow together without gatekeeping or platform limitations.
        </p>

        <div className="flex gap-4 justify-center mb-16">
          <Link to="/register">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link to="/explore">
            <Button size="lg" variant="outline">
              Explore Projects
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Real-time Collaboration</h3>
            <p className="text-muted-foreground">
              Google Docs-style multiplayer editing with instant sync across all collaborators.
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">AI-Native Platform</h3>
            <p className="text-muted-foreground">
              Integrated AI assistance with prompt libraries and multi-agent orchestration.
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">One-Click Deploy</h3>
            <p className="text-muted-foreground">
              From idea to live URL in under 60 seconds with global edge deployment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
