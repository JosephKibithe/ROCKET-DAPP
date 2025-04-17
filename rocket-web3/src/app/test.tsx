"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark to-black text-white p-8">
      <h1 className="text-4xl font-heading text-primary mb-4">
        ROCKET Test Page
      </h1>
      <p className="text-secondary font-body mb-8">
        Testing our components and styling
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="bg-dark/50 border-primary/50">
          <CardHeader>
            <CardTitle className="text-primary font-heading">
              ShadCN Card Component
            </CardTitle>
            <CardDescription className="text-gray-300">
              Testing the Card component from ShadCN
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-body">
              This card uses our custom Tailwind colors and fonts.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="bg-primary hover:bg-primary/80">
              Primary Button
            </Button>
          </CardFooter>
        </Card>

        <div>
          <h2 className="text-2xl font-heading text-primary mb-4">
            Testing Tabs
          </h2>
          <Tabs defaultValue="tab1" className="bg-dark/30 p-4 rounded">
            <TabsList className="bg-dark grid grid-cols-2 mb-4">
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="text-gray-300">
              <p>
                This is the content for Tab 1. Using Comic Neue for headings and
                Inter for body text.
              </p>
            </TabsContent>
            <TabsContent value="tab2" className="text-gray-300">
              <p>
                This is the content for Tab 2. The background gradient uses our
                defined colors.
              </p>
            </TabsContent>
          </Tabs>

          <h2 className="text-2xl font-heading text-primary mt-8 mb-4">
            Testing Dialog
          </h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-secondary text-secondary hover:bg-secondary/20"
              >
                Open Dialog
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-dark text-white border-primary">
              <DialogHeader>
                <DialogTitle className="text-primary font-heading">
                  Dialog Title
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  This dialog uses our custom styling with the branded colors.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="font-body">
                  Dialog content with our custom font.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
