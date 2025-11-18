import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';

export function ProjectPage() {
  const { username, projectSlug } = useParams<{ username: string; projectSlug: string }>();
  const currentUser = useAuthStore((state) => state.user);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', username, projectSlug],
    queryFn: async () => {
      const response = await projectApi.get(username!, projectSlug!);
      return response.data.data;
    },
    enabled: !!username && !!projectSlug,
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!project) {
    return <div className="container mx-auto px-4 py-8">Project not found</div>;
  }

  const isOwner = currentUser?.username === username;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Link to={`/${username}`} className="hover:underline">
                {username}
              </Link>
              <span>/</span>
              <span className="font-semibold text-foreground">{project.name}</span>
            </div>
            {project.description && (
              <p className="text-lg">{project.description}</p>
            )}
          </div>

          <div className="flex gap-2">
            {isOwner && (
              <Link to={`/${username}/${projectSlug}/edit`}>
                <Button>Edit</Button>
              </Link>
            )}
            <Button variant="outline">Star ({project.star_count})</Button>
            <Button variant="outline">Fork ({project.fork_count})</Button>
          </div>
        </div>

        <div className="flex gap-4 text-sm text-muted-foreground">
          <span className="capitalize">{project.visibility}</span>
          {project.deployment_url && (
            <>
              <span>•</span>
              <a
                href={project.deployment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                View Live
              </a>
            </>
          )}
          {project.tech_stack && project.tech_stack.length > 0 && (
            <>
              <span>•</span>
              <span>{project.tech_stack.join(', ')}</span>
            </>
          )}
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">README</h2>
        {project.readme ? (
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap">{project.readme}</pre>
          </div>
        ) : (
          <p className="text-muted-foreground">No README yet</p>
        )}
      </div>
    </div>
  );
}
