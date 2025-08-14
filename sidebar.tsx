import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GRADES, SUBJECTS, type Grade, type Subject, type Session } from "@/lib/types";

interface SidebarProps {
  currentGrade: Grade;
  currentSubject: Subject;
  session?: Session;
  onGradeChange: (grade: Grade) => void;
  onSubjectChange: (subject: Subject) => void;
}

export function Sidebar({
  currentGrade,
  currentSubject,
  session,
  onGradeChange,
  onSubjectChange,
}: SidebarProps) {
  const questionsProgress = session ? Math.min((session.questionsAsked / 20) * 100, 100) : 0;
  const studyTimeProgress = session ? Math.min((session.studyTimeMinutes / 60) * 100, 100) : 0;

  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Grade Selection Card */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <i className="fas fa-layer-group text-primary mr-2" />
            Select Your Grade
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {GRADES.map((grade) => (
              <Button
                key={grade}
                variant={currentGrade === grade ? "default" : "outline"}
                size="sm"
                className={`p-3 text-center rounded-lg transition-all duration-200 text-sm font-medium ${
                  currentGrade === grade
                    ? "border-2 border-primary bg-primary text-white"
                    : "border-2 border-gray-200 hover:border-primary hover:bg-primary hover:text-white"
                }`}
                onClick={() => onGradeChange(grade)}
              >
                Grade {grade}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subject Selection Card */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <i className="fas fa-book text-secondary mr-2" />
            Choose Subject
          </h3>
          <div className="space-y-2">
            {SUBJECTS.map((subject) => (
              <Button
                key={subject.id}
                variant={currentSubject === subject.id ? "default" : "outline"}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center justify-start ${
                  currentSubject === subject.id
                    ? "border-2 border-secondary bg-secondary text-white"
                    : "border border-gray-200 hover:border-secondary hover:bg-secondary hover:text-white"
                }`}
                onClick={() => onSubjectChange(subject.id)}
              >
                <i className={`fas fa-${subject.icon} mr-3 text-sm`} />
                <span className="font-medium">{subject.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Tracking Card */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <i className="fas fa-chart-line text-accent mr-2" />
            Today's Progress
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Questions Asked</span>
                <span className="text-sm font-bold text-primary">
                  {session?.questionsAsked || 0}
                </span>
              </div>
              <Progress value={questionsProgress} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Study Time</span>
                <span className="text-sm font-bold text-secondary">
                  {session?.studyTimeMinutes || 0} min
                </span>
              </div>
              <Progress value={studyTimeProgress} className="h-2" />
            </div>
            <div className="bg-light-gray dark:bg-gray-800 rounded-lg p-3 mt-4">
              <div className="flex items-center">
                <i className="fas fa-brain text-accent mr-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {session?.questionsAsked ? "Building understanding through discovery!" : "Ready to explore and discover!"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
