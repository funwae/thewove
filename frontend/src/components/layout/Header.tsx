import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/button';

export function Header() {
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold">
              The Wove
            </Link>

            <nav className="flex gap-4">
              <Link to="/explore" className="text-sm hover:underline">
                Explore
              </Link>
              {isAuthenticated && (
                <Link to="/dashboard" className="text-sm hover:underline">
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to={`/${user?.username}`}>
                  <Button variant="ghost" size="sm">
                    {user?.username}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={clearAuth}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
