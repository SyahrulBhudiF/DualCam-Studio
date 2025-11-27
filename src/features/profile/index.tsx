import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { profileSchema } from "@/libs/schemas/user";
import { useUserStore } from "@/libs/store/UserStore";
import { useQuestionnaireStore } from "@/libs/store/QuestionnaireStore";

export function Profile() {
  const navigate = useNavigate();
  const store = useUserStore();
  const questionnaireStore = useQuestionnaireStore();

  const form = useForm({
    defaultValues: {
      name: "",
      class: "",
      mode: "full",
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = profileSchema.safeParse({
          name: value.name,
          class: value.class,
        });

        if (!result.success) {
          return result.error.issues.reduce(
            (acc, issue) => {
              const path = issue.path[0] as string;
              acc[path] = issue.message;
              return acc;
            },
            {} as Record<string, string>
          );
        }

        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      store.setUser({ name: value.name, class: value.class });

      questionnaireStore.reset();

      if (value.mode === "segmented") {
        navigate({ to: "/questionnaire/segmented" });
      } else {
        navigate({ to: "/questionnaire" });
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Student Profile</CardTitle>
          <CardDescription>
            Enter your details and choose recording mode.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field name="name">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Ahmad"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-500">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="class">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="class">Class / Group</Label>
                  <Input
                    id="class"
                    placeholder="e.g. D4 TI 4G"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-500">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="mode">
              {(field) => (
                <div className="space-y-3 pt-2">
                  <Label>Select Mode</Label>
                  <RadioGroup
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem
                        value="full"
                        id="full"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="full"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <span className="text-lg mb-1">⚡</span>
                        <span className="font-semibold">Full Session</span>
                        <span className="text-xs text-muted-foreground text-center mt-1">
                          Record once for all questions
                        </span>
                      </Label>
                    </div>

                    <div>
                      <RadioGroupItem
                        value="segmented"
                        id="segmented"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="segmented"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <span className="text-lg mb-1">✂️</span>
                        <span className="font-semibold">Per Question</span>
                        <span className="text-xs text-muted-foreground text-center mt-1">
                          Record and upload step-by-step
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </form.Field>

            <Button type="submit" className="w-full" size="lg">
              Start Questionnaire
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
