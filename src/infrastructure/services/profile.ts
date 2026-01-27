import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { eq } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import type { NewProfile, Profile } from "../db";
import { profiles } from "../db";
import { DatabaseError, ProfileNotFoundError } from "../errors";

export interface IProfileService {
	readonly getById: (
		id: string,
	) => Effect.Effect<Profile, ProfileNotFoundError | DatabaseError>;
	readonly getByEmail: (
		email: string,
	) => Effect.Effect<Profile | null, DatabaseError>;
	readonly create: (
		data: Omit<NewProfile, "id" | "createdAt">,
	) => Effect.Effect<Profile, DatabaseError>;
	readonly upsertByEmail: (
		email: string,
		data: Omit<NewProfile, "id" | "createdAt" | "email">,
	) => Effect.Effect<Profile, DatabaseError>;
	readonly getAll: Effect.Effect<Profile[], DatabaseError>;
	readonly getUniqueClasses: Effect.Effect<string[], DatabaseError>;
}

export class ProfileService extends Context.Tag("ProfileService")<
	ProfileService,
	IProfileService
>() {}

export const ProfileServiceLive = Layer.effect(
	ProfileService,
	Effect.gen(function* () {
		const db = yield* PgDrizzle;

		const getById: IProfileService["getById"] = (id) =>
			Effect.tryPromise({
				try: () =>
					db
						.select()
						.from(profiles)
						.where(eq(profiles.id, id))
						.then((rows) => rows[0] as Profile | undefined),
				catch: (error) =>
					new DatabaseError({
						message: "Failed to fetch profile",
						cause: error,
					}),
			}).pipe(
				Effect.flatMap((result) =>
					result
						? Effect.succeed(result)
						: Effect.fail(new ProfileNotFoundError({ id })),
				),
			);

		const getByEmail: IProfileService["getByEmail"] = (email) =>
			Effect.tryPromise({
				try: () =>
					db
						.select()
						.from(profiles)
						.where(eq(profiles.email, email))
						.then((rows) => (rows[0] as Profile | undefined) ?? null),
				catch: (error) =>
					new DatabaseError({
						message: "Failed to fetch profile by email",
						cause: error,
					}),
			});

		const create: IProfileService["create"] = (data) =>
			Effect.tryPromise({
				try: () =>
					db
						.insert(profiles)
						.values(data)
						.returning()
						.then((rows) => rows[0] as Profile),
				catch: (error) =>
					new DatabaseError({
						message: "Failed to create profile",
						cause: error,
					}),
			});

		const upsertByEmail: IProfileService["upsertByEmail"] = (email, data) =>
			Effect.gen(function* () {
				const existing = yield* getByEmail(email);

				if (existing) {
					const updated = yield* Effect.tryPromise({
						try: () =>
							db
								.update(profiles)
								.set(data)
								.where(eq(profiles.id, existing.id))
								.returning()
								.then((rows) => rows[0] as Profile),
						catch: (error) =>
							new DatabaseError({
								message: "Failed to update profile",
								cause: error,
							}),
					});
					return updated;
				}

				return yield* create({ ...data, email });
			});

		const getAll: IProfileService["getAll"] = Effect.tryPromise({
			try: () =>
				db
					.select()
					.from(profiles)
					.then((rows) => rows as Profile[]),
			catch: (error) =>
				new DatabaseError({
					message: "Failed to fetch profiles",
					cause: error,
				}),
		});

		const getUniqueClasses: IProfileService["getUniqueClasses"] = Effect.gen(
			function* () {
				const allProfiles = yield* getAll;
				const classes = new Set<string>();
				for (const p of allProfiles) {
					if (p.class) classes.add(p.class);
				}
				return Array.from(classes).sort();
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
);
