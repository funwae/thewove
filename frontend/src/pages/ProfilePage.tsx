import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../lib/api';

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', username],
    queryFn: async () => {
      const response = await userApi.get(username!);
      return response.data.data;
    },
    enabled: !!username,
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['userProjects', username],
    queryFn: async () => {
      const response = await userApi.getProjects(username!);
      return response.data.data;
    },
    enabled: !!username,
  });

  if (userLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!user) {
    return <div className="container mx-auto px-4 py-8">User not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{user.display_name || user.username}</h1>
        <p className="text-muted-foreground">@{user.username}</p>
        {user.bio && <p className="mt-4">{user.bio}</p>}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Projects</h2>
        {projectsLoading ? (
          <div className="text-center py-12">Loading projects...</div>
        ) : projects && projects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project: any) => (
              <Link
                key={project.id}
                to={`/${username}/${project.slug}`}
                className="border rounded-lg p-4 hover:border-primary transition-colors"
              >
                <h3 className="font-semibold mb-2">{project.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {project.description || 'No description'}
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>{project.star_count} stars</span>
                  <span>•</span>
                  <span>{project.fork_count} forks</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">No public projects yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
