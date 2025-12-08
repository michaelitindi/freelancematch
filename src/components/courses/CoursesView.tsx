"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Clock,
  Award,
  Play,
  CheckCircle2,
  Lock,
  ChevronRight,
  Search,
  Filter,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCourses } from "@/hooks/useApi";
import type { Course } from "@/types";

export function CoursesView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const {
    courses: apiCourses,
    progress,
    loading,
    fetchCourses,
    fetchProgress,
  } = useCourses();

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
    fetchProgress();
  }, [fetchCourses, fetchProgress]);

  // Transform API courses to match Course type with progress
  const courses: Course[] = apiCourses.map((course: any) => {
    const courseProgress = progress.find((p: any) => p.course_id === course.id);
    const modules = course.modules ? JSON.parse(course.modules) : [];
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty || "beginner",
      duration: course.duration || "2 hours",
      thumbnail:
        course.thumbnail ||
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
      badge: course.badge || "📚",
      modules: modules.map((m: any, index: number) => ({
        id: m.id || `module-${index}`,
        title: m.title || `Module ${index + 1}`,
        duration: m.duration || "15 min",
        completed: courseProgress
          ? index < (courseProgress.completed_modules || 0)
          : false,
      })),
    };
  });

  // Extract unique categories from courses
  const categories: string[] = Array.from(
    new Set(courses.map((c) => c.category)),
  );

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || course.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getProgress = (course: Course) => {
    const completed = course.modules.filter((m) => m.completed).length;
    return (completed / course.modules.length) * 100;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (selectedCourse) {
    return (
      <CourseDetail
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00B8A9]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-[#1A2B4A]">
            Learning Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete courses to unlock new categories and boost your matching
            priority
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-[#00B8A9]/10 text-[#00B8A9] px-4 py-2">
            <Award className="h-4 w-4 mr-2" />2 Badges Earned
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="all" className="data-[state=active]:bg-white">
            All Courses
          </TabsTrigger>
          <TabsTrigger
            value="in-progress"
            className="data-[state=active]:bg-white"
          >
            In Progress
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-white"
          >
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const progress = getProgress(course);

              return (
                <Card
                  key={course.id}
                  className="card-shadow hover:card-shadow-hover transition-all hover:-translate-y-1 cursor-pointer overflow-hidden group"
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute top-3 right-3 text-3xl">
                      {course.badge}
                    </span>
                    <div className="absolute bottom-3 left-3 right-3">
                      <Badge
                        className={cn(
                          "text-xs",
                          getDifficultyColor(course.difficulty),
                        )}
                      >
                        {course.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {course.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.modules.length} modules</span>
                      </div>
                    </div>
                    {progress > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span className="font-mono">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="in-progress">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses
              .filter((c) => {
                const progress = getProgress(c);
                return progress > 0 && progress < 100;
              })
              .map((course) => {
                const progress = getProgress(course);

                return (
                  <Card
                    key={course.id}
                    className="card-shadow hover:card-shadow-hover transition-all hover:-translate-y-1 cursor-pointer overflow-hidden group"
                    onClick={() => setSelectedCourse(course)}
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute top-3 right-3 text-3xl">
                        {course.badge}
                      </span>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">
                        {course.title}
                      </h3>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span className="font-mono">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <Card className="card-shadow">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No Completed Courses Yet
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                Complete courses to earn badges and unlock new opportunities.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Benefits Section */}
      <Card className="card-shadow bg-gradient-to-br from-[#1A2B4A] to-[#2A3B5A] text-white">
        <CardHeader>
          <CardTitle className="font-display text-white">
            Why Complete Courses?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Award className="h-5 w-5 text-[#00B8A9]" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Earn Badges</h4>
                <p className="text-sm text-white/70">
                  Display certifications on your profile to stand out
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Lock className="h-5 w-5 text-[#00B8A9]" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Unlock Categories</h4>
                <p className="text-sm text-white/70">
                  Access premium service categories with higher rates
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <ChevronRight className="h-5 w-5 text-[#00B8A9]" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Higher Priority</h4>
                <p className="text-sm text-white/70">
                  Get matched more frequently with qualified buyers
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Course Detail Component
function CourseDetail({
  course,
  onBack,
}: {
  course: Course;
  onBack: () => void;
}) {
  const [activeModule, setActiveModule] = useState(0);
  const progress =
    (course.modules.filter((m) => m.completed).length / course.modules.length) *
    100;

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="mb-4">
        ← Back to Courses
      </Button>

      {/* Course Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="aspect-video rounded-xl overflow-hidden mb-6">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{course.badge}</span>
            <div>
              <h1 className="text-3xl font-bold font-display text-[#1A2B4A]">
                {course.title}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="secondary">{course.category}</Badge>
                <Badge
                  className={cn(
                    course.difficulty === "beginner" &&
                      "bg-green-100 text-green-700",
                    course.difficulty === "intermediate" &&
                      "bg-yellow-100 text-yellow-700",
                    course.difficulty === "advanced" &&
                      "bg-red-100 text-red-700",
                  )}
                >
                  {course.difficulty}
                </Badge>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground mb-6">{course.description}</p>

          {/* Progress */}
          <Card className="card-shadow mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Course Progress</span>
                <span className="font-mono text-[#00B8A9]">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Modules List */}
        <div>
          <Card className="card-shadow sticky top-24">
            <CardHeader>
              <CardTitle className="font-display">Course Modules</CardTitle>
              <CardDescription>
                {course.modules.filter((m) => m.completed).length} of{" "}
                {course.modules.length} completed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {course.modules.map((module, index) => (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(index)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                    activeModule === index
                      ? "bg-[#00B8A9]/10"
                      : "hover:bg-muted/50",
                  )}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                      module.completed
                        ? "bg-[#00B8A9] text-white"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {module.completed ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "font-medium text-sm truncate",
                        module.completed && "text-muted-foreground",
                      )}
                    >
                      {module.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {module.duration}
                    </p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Module Content */}
      <Card className="card-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display">
                {course.modules[activeModule].title}
              </CardTitle>
              <CardDescription>
                {course.modules[activeModule].duration}
              </CardDescription>
            </div>
            {!course.modules[activeModule].completed && (
              <Button className="bg-[#00B8A9] hover:bg-[#00A89A] text-white">
                <Play className="h-4 w-4 mr-2" />
                Start Module
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {course.modules[activeModule].content}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
