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
import { profileSchema } from "@/libs/schemas/user";
import { useUserStore } from "@/libs/store/UserStore";

export function Profile() {
  const navigate = useNavigate();
  const store = useUserStore();

  const form = useForm({
    defaultValues: {
      name: "",
      class: "",
    },
    validators: {
      onSubmit: profileSchema,
    },
    onSubmit: async ({ value }) => {
      store.setUser(value);

      navigate({
        to: "/questionnaire",
      });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black p-4">
      <Card className="w-full shadow-sm shadow-black dark:shadow-gray-500 bg-black dark:bg-white border border-gray-900 dark:border-b-gray-100 sm:max-w-full md:max-w-1/2 lg:max-w-1/3">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white dark:text-black">Student Profile</CardTitle>
          <CardDescription className="text-gray-400 dark:text-gray-600">
            Enter your details to start the questionnaire.
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
                  <Label htmlFor="name" className="text-white dark:text-black text-md">Full Name</Label>
                  <Input
                    id="name"
                    className="bg-gray-950 dark:bg-white text-white dark:text-black border-gray-500/20"
                    placeholder="Ahmad"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors?.[0] && (
                    <p className="text-sm text-red-500">
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="class">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="class" className="text-white dark:text-black text-md">Class / Group</Label>
                  <Input
                    id="class"
                    className="bg-gray-950 dark:bg-white text-white dark:text-black border-gray-500/20"
                    placeholder="e.g. D4 TI 4G"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors?.[0] && (
                    <p className="text-sm text-red-500">
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <Button type="submit" className="w-full bg-white dark:bg-black text-black dark:text-white" size="lg">
              Next Step
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
