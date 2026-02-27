import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { eq, isNotNull } from "drizzle-orm";
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
			Effect.gen(function* () {
				const [result] = yield* db
					.select()
					.from(profiles)
					.where(eq(profiles.id, id));
				if (!result) {
					return yield* Effect.fail(new ProfileNotFoundError({ id }));
				}
				return result as Profile;
			}).pipe(
				Effect.mapError((e): ProfileNotFoundError | DatabaseError =>
					e instanceof ProfileNotFoundError
						? e
						: new DatabaseError({
								message: "Failed to fetch profile",
								cause: e,
							}),
				),
			);

		const getByEmail: IProfileService["getByEmail"] = (email) =>
			Effect.gen(function* () {
				const [result] = yield* db
					.select()
					.from(profiles)
					.where(eq(profiles.email, email));
				return (result as Profile | undefined) ?? null;
			}).pipe(
				Effect.mapError(
					(e) =>
						new DatabaseError({
							message: "Failed to fetch profile by email",
							cause: e,
						}),
				),
			);

		const create: IProfileService["create"] = (data) =>
			Effect.gen(function* () {
				const [result] = yield* db.insert(profiles).values(data).returning();
				return result as Profile;
			}).pipe(
				Effect.mapError(
					(e) =>
						new DatabaseError({
							message: "Failed to create profile",
							cause: e,
						}),
				),
			);

		const upsertByEmail: IProfileService["upsertByEmail"] = (email, data) =>
			Effect.gen(function* () {
				const existing = yield* getByEmail(email);

				if (existing) {
					const [updated] = yield* db
						.update(profiles)
						.set(data)
						.where(eq(profiles.id, existing.id))
						.returning();
					return updated as Profile;
				}

				return yield* create({ ...data, email });
			}).pipe(
				Effect.mapError((e) =>
					e instanceof DatabaseError
						? e
						: new DatabaseError({
								message: "Failed to upsert profile",
								cause: e,
							}),
				),
			);

		const getAll: IProfileService["getAll"] = Effect.gen(function* () {
			const rows = yield* db.select().from(profiles);
			return rows as Profile[];
		}).pipe(
			Effect.mapError(
				(e) =>
					new DatabaseError({
						message: "Failed to fetch profiles",
						cause: e,
					}),
			),
		);

		const getUniqueClasses: IProfileService["getUniqueClasses"] = Effect.gen(
			function* () {
				const rows = yield* db
					.selectDistinct({ class: profiles.class })
					.from(profiles)
					.where(isNotNull(profiles.class));

				return rows
					.map((r) => r.class as string)
					.sort();
			},
		).pipe(
			Effect.mapError(
				(e) =>
					new DatabaseError({
						message: "Failed to fetch unique classes",
						cause: e,
					}),
			),
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
