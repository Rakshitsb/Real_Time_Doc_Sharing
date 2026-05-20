import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Shield, Sparkles } from "lucide-react";
import { ROUTES } from "../constants/routes";
import PublicLayout from "../layouts/PublicLayout";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

const LandingPage = () => {
  return (
    <PublicLayout>
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 pb-16 pt-28">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
            <Badge variant="accent" className="mb-5">
              Modern document workspace
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
              DOCZZ
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              A polished real-time document sharing workspace with clean authentication, document management, and a UI foundation ready for collaboration features.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link to={ROUTES.LOGIN}>
                  Open workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to={ROUTES.REGISTER}>Create account</Link>
              </Button>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className="rounded-lg border border-border bg-card p-4 shadow-soft"
          >
            <div className="rounded-lg bg-secondary/60 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Product brief</p>
                  <p className="text-xs text-muted-foreground">Shared document</p>
                </div>
                <Badge variant="outline">Live-ready</Badge>
              </div>
              <div className="space-y-3 rounded-lg bg-card p-5">
                <div className="h-3 w-2/3 rounded bg-primary/20" />
                <div className="h-3 w-full rounded bg-secondary" />
                <div className="h-3 w-5/6 rounded bg-secondary" />
                <div className="grid grid-cols-3 gap-3 pt-4">
                  {[FileText, Sparkles, Shield].map((Icon, index) => (
                    <Card key={index} className="p-4">
                      <Icon className="mb-3 h-5 w-5 text-accent" />
                      <div className="h-2 w-10 rounded bg-secondary" />
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </PublicLayout>
  );
};

export default LandingPage;
