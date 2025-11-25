import { createFileRoute, Outlet } from "@tanstack/react-router";
import { fetchPosts } from "../../../utils/posts";

export const Route = createFileRoute("/_authed/post/posts")({
	loader: () => fetchPosts(),
	component: PostsComponent,
});

function PostsComponent() {
	const posts = Route.useLoaderData();

	return (
		<div className="p-2 flex gap-2">
			<ul className="list-disc pl-4">
				{[...posts, { id: "i-do-not-exist", title: "Non-existent Post" }].map(
					(post) => {
						return (
							<li key={post.id} className="whitespace-nowrap">
								<div>{post.title.substring(0, 20)}</div>
							</li>
						);
					},
				)}
			</ul>
			<hr />
			<Outlet />
		</div>
	);
}
