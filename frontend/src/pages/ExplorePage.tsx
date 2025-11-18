import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectApi } from '../lib/api';

export function ExplorePage() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['exploreProjects'],
    queryFn: async () => {
      const response = await projectApi.list({ visibility: 'public', limit: 20 });
      return response.data.data;
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Projects</h1>
        <p className="text-muted-foreground">
          Discover amazing projects built by the community
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading projects...</div>
      ) : projects && projects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <div key={project.id} className="border rounded-lg p-6 hover:border-primary transition-colors">
              <Link to={`/${project.owner_username}/${project.slug}`}>
                <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {project.description || 'No description'}
                </p>
                <div className="flex gap-2 flex-wrap mb-3">
                  {project.tags?.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-xs px-2 py-1 bg-secondary rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{project.star_count} stars</span>
                  <span>{project.fork_count} forks</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects found</p>
        </div>
      )}
    </div>
  );
}
