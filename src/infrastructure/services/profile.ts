import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { eq, isNotNull } from "drizzle-orm";
import { Effect } from "effect";
import type { NewProfile, Profile } from "../db";
import { profiles } from "../db";
import { DatabaseError, ProfileNotFoundError } from "../errors";

export class ProfileService extends Effect.Service<ProfileService>()(
	"ProfileService",
	{
		accessors: true,
		dependencies: [],
		effect: Effect.gen(function* () {
			const db = yield* PgDrizzle;

			const getById = Effect.fn("ProfileService.getById")(function* (
				id: string,
			) {
				const [result] = yield* db
					.select()
					.from(profiles)
					.where(eq(profiles.id, id)).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to fetch profile",
									cause: e,
								}),
						),
					);
				if (!result) {
					return yield* Effect.fail(new ProfileNotFoundError({ id }));
				}
				return result as Profile;
			});

			const getByEmail = Effect.fn("ProfileService.getByEmail")(function* (
				email: string,
			) {
				const [result] = yield* db
					.select()
					.from(profiles)
					.where(eq(profiles.email, email)).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to fetch profile by email",
									cause: e,
								}),
						),
					);
				return (result as Profile | undefined) ?? null;
			});

			const create = Effect.fn("ProfileService.create")(function* (
				data: Omit<NewProfile, "id" | "createdAt">,
			) {
				const [result] = yield* db.insert(profiles).values(data).returning().pipe(
					Effect.mapError(
						(e) =>
							new DatabaseError({
								message: "Failed to create profile",
								cause: e,
							}),
					),
				);
				return result as Profile;
			});

			const upsertByEmail = Effect.fn("ProfileService.upsertByEmail")(function* (
				email: string,
				data: Omit<NewProfile, "id" | "createdAt" | "email">,
			) {
				const existing = yield* getByEmail(email);

				if (existing) {
					const [updated] = yield* db
						.update(profiles)
						.set(data)
						.where(eq(profiles.id, existing.id))
						.returning().pipe(
							Effect.mapError(
								(e) =>
									new DatabaseError({
										message: "Failed to upsert profile",
										cause: e,
									}),
							),
						);
					return updated as Profile;
				}

				return yield* create({ ...data, email });
			});

			const getAll = Effect.fn("ProfileService.getAll")(function* () {
				const rows = yield* db.select().from(profiles).pipe(
					Effect.mapError(
						(e) =>
							new DatabaseError({
								message: "Failed to fetch profiles",
								cause: e,
							}),
					),
				);
				return rows as Profile[];
			});

			const getUniqueClasses = Effect.fn("ProfileService.getUniqueClasses")(
				function* () {
					const rows = yield* db
						.selectDistinct({ class: profiles.class })
						.from(profiles)
						.where(isNotNull(profiles.class)).pipe(
							Effect.mapError(
								(e) =>
									new DatabaseError({
										message: "Failed to fetch unique classes",
										cause: e,
									}),
							),
						);

					return rows.map((r) => r.class as string).sort();
				},
			);

			return {
				getById,
				getByEmail,
				create,
				upsertByEmail,
				getAll,
				getUniqueClasses,
			};
		}),
	},
) {}
