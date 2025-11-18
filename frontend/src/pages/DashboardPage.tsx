import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['userProjects', user?.username],
    queryFn: async () => {
      if (!user?.username) return [];
      const response = await projectApi.list({ owner: user.username });
      return response.data.data;
    },
    enabled: !!user?.username,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.displayName || user?.username}!
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Your Projects</h2>
          <Button onClick={() => setShowCreateModal(true)}>
            New Project
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading projects...</div>
        ) : projects && projects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project: any) => (
              <Link
                key={project.id}
                to={`/${user?.username}/${project.slug}`}
                className="border rounded-lg p-4 hover:border-primary transition-colors"
              >
                <h3 className="font-semibold mb-2">{project.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {project.description || 'No description'}
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>{project.visibility}</span>
                  <span>•</span>
                  <span>{project.star_count} stars</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create Your First Project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
