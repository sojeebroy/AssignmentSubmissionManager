using AssignmentSubmissionSystem.Api.Models.Entities;
using AssignmentSubmissionSystem.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;
using AssignmentSubmissionSystem.Api.Services.Interfaces;


namespace AssignmentSubmissionSystem.Api.Services
{
    public class DataSeeder
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHashingService _passwordService;
        private readonly ILogger<DataSeeder> _logger;

        public DataSeeder(ApplicationDbContext context, IPasswordHashingService passwordService, ILogger<DataSeeder> logger)
        {
            _context = context;
            _passwordService = passwordService;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            try
            {
                // Check if data already exists
                if (await _context.Users.AnyAsync())
                {
                    _logger.LogInformation("Database already seeded, skipping...");
                    return;
                }

                _logger.LogInformation("Starting database seeding...");

                // Create users
                var admin = new User
                {
                    Id = Guid.Parse("10000000-0000-0000-0000-000000000001"),
                    Email = "admin@example.com",
                    FullName = "Admin User",
                    PasswordHash = _passwordService.HashPassword("Admin@123"),
                    Role = UserRole.Admin,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var teacher1 = new User
                {
                    Id = Guid.Parse("20000000-0000-0000-0000-000000000001"),
                    Email = "teacher1@example.com",
                    FullName = "Teacher One",
                    PasswordHash = _passwordService.HashPassword("Teacher@123"),
                    Role = UserRole.Teacher,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var teacher2 = new User
                {
                    Id = Guid.Parse("20000000-0000-0000-0000-000000000002"),
                    Email = "teacher2@example.com",
                    FullName = "Teacher Two",
                    PasswordHash = _passwordService.HashPassword("Teacher@123"),
                    Role = UserRole.Teacher,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var student1 = new User
                {
                    Id = Guid.Parse("30000000-0000-0000-0000-000000000001"),
                    Email = "student1@example.com",
                    FullName = "Student One",
                    PasswordHash = _passwordService.HashPassword("Student@123"),
                    Role = UserRole.Student,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var student2 = new User
                {
                    Id = Guid.Parse("30000000-0000-0000-0000-000000000002"),
                    Email = "student2@example.com",
                    FullName = "Student Two",
                    PasswordHash = _passwordService.HashPassword("Student@123"),
                    Role = UserRole.Student,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var student3 = new User
                {
                    Id = Guid.Parse("30000000-0000-0000-0000-000000000003"),
                    Email = "student3@example.com",
                    FullName = "Student Three",
                    PasswordHash = _passwordService.HashPassword("Student@123"),
                    Role = UserRole.Student,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Users.AddRange(admin, teacher1, teacher2, student1, student2, student3);

                // Create subjects
                var mathSubject = new Subject
                {
                    Id = Guid.NewGuid(),
                    Name = "Mathematics",
                    Code = "MATH"
                };

                var biologySubject = new Subject
                {
                    Id = Guid.NewGuid(),
                    Name = "Biology",
                    Code = "BIO"
                };

                _context.Subjects.AddRange(mathSubject, biologySubject);

                await _context.SaveChangesAsync();

                // Create classes
                var mathClass = new ClassCourse
                {
                    Id = Guid.NewGuid(),
                    Name = "Grade 10 Mathematics",
                    SubjectId = mathSubject.Id,
                    CreatedByAdminId = admin.Id,
                    CreatedAt = DateTime.UtcNow
                };

                var biologyClass = new ClassCourse
                {
                    Id = Guid.NewGuid(),
                    Name = "Grade 10 Biology",
                    SubjectId = biologySubject.Id,
                    CreatedByAdminId = admin.Id,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Classes.AddRange(mathClass, biologyClass);

                await _context.SaveChangesAsync();

                // Assign teachers to classes
                var ta1 = new TeacherAssignment
                {
                    Id = Guid.NewGuid(),
                    TeacherId = teacher1.Id,
                    ClassId = mathClass.Id,
                    AssignedAt = DateTime.UtcNow
                };

                var ta2 = new TeacherAssignment
                {
                    Id = Guid.NewGuid(),
                    TeacherId = teacher2.Id,
                    ClassId = biologyClass.Id,
                    AssignedAt = DateTime.UtcNow
                };

                _context.TeacherAssignments.AddRange(ta1, ta2);

                // Enroll students in classes
                var enrollments = new List<StudentEnrollment>
                {
                    new() { Id = Guid.NewGuid(), StudentId = student1.Id, ClassId = mathClass.Id, EnrolledAt = DateTime.UtcNow },
                    new() { Id = Guid.NewGuid(), StudentId = student2.Id, ClassId = mathClass.Id, EnrolledAt = DateTime.UtcNow },
                    new() { Id = Guid.NewGuid(), StudentId = student3.Id, ClassId = mathClass.Id, EnrolledAt = DateTime.UtcNow },
                    new() { Id = Guid.NewGuid(), StudentId = student1.Id, ClassId = biologyClass.Id, EnrolledAt = DateTime.UtcNow },
                    new() { Id = Guid.NewGuid(), StudentId = student2.Id, ClassId = biologyClass.Id, EnrolledAt = DateTime.UtcNow },
                    new() { Id = Guid.NewGuid(), StudentId = student3.Id, ClassId = biologyClass.Id, EnrolledAt = DateTime.UtcNow }
                };

                _context.StudentEnrollments.AddRange(enrollments);

                await _context.SaveChangesAsync();

                // Create assignments
                var draftAssignment = new Assignment
                {
                    Id = Guid.NewGuid(),
                    ClassId = mathClass.Id,
                    TeacherId = teacher1.Id,
                    Title = "Algebra Basics (Draft)",
                    Description = "Introduction to algebraic equations and expressions",
                    DeadlineUtc = DateTime.UtcNow.AddDays(14),
                    MaxMarks = 100,
                    Status = AssignmentStatus.Draft,
                    CreatedAt = DateTime.UtcNow
                };

                var publishedAssignment1 = new Assignment
                {
                    Id = Guid.NewGuid(),
                    ClassId = mathClass.Id,
                    TeacherId = teacher1.Id,
                    Title = "Linear Equations",
                    Description = "Solve linear equations in one and two variables",
                    DeadlineUtc = DateTime.UtcNow.AddDays(7),
                    MaxMarks = 50,
                    Status = AssignmentStatus.Published,
                    CreatedAt = DateTime.UtcNow.AddDays(-3),
                    PublishedAt = DateTime.UtcNow.AddDays(-2)
                };

                var publishedAssignment2 = new Assignment
                {
                    Id = Guid.NewGuid(),
                    ClassId = biologyClass.Id,
                    TeacherId = teacher2.Id,
                    Title = "Cell Structure and Function",
                    Description = "Study the anatomy and functions of plant and animal cells",
                    DeadlineUtc = DateTime.UtcNow.AddDays(10),
                    MaxMarks = 75,
                    Status = AssignmentStatus.Published,
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    PublishedAt = DateTime.UtcNow.AddDays(-4)
                };

                _context.Assignments.AddRange(draftAssignment, publishedAssignment1, publishedAssignment2);

                await _context.SaveChangesAsync();

                // Create submissions
                var submission1 = new Submission
                {
                    Id = Guid.NewGuid(),
                    AssignmentId = publishedAssignment1.Id,
                    StudentId = student1.Id,
                    AnswerContent = "2x + 5 = 15, so x = 5. For two variables: x + y = 10, 2x - y = 5, solving gives x = 5, y = 5.",
                    SubmittedAt = DateTime.UtcNow.AddDays(-1),
                    Status = SubmissionStatus.Graded,
                    Marks = 45,
                    Feedback = "Good work! Minor calculation error in the second part.",
                    GradedAt = DateTime.UtcNow.AddHours(-12),
                    GradedByTeacherId = teacher1.Id
                };

                var submission2 = new Submission
                {
                    Id = Guid.NewGuid(),
                    AssignmentId = publishedAssignment1.Id,
                    StudentId = student2.Id,
                    AnswerContent = "x = 5 for first equation. Second part incomplete.",
                    SubmittedAt = DateTime.UtcNow.AddDays(-2),
                    Status = SubmissionStatus.Submitted,
                    Marks = null,
                    Feedback = null,
                    GradedAt = null,
                    GradedByTeacherId = null
                };

                var submission3 = new Submission
                {
                    Id = Guid.NewGuid(),
                    AssignmentId = publishedAssignment2.Id,
                    StudentId = student1.Id,
                    AnswerContent = "Animal cells contain nucleus, mitochondria, ER, Golgi, lysosomes. Plant cells additionally have cell wall, chloroplasts, vacuoles.",
                    SubmittedAt = DateTime.UtcNow.AddDays(-4),
                    Status = SubmissionStatus.Graded,
                    Marks = 70,
                    Feedback = "Excellent knowledge! Very comprehensive answer.",
                    GradedAt = DateTime.UtcNow.AddDays(-3),
                    GradedByTeacherId = teacher2.Id
                };

                _context.Submissions.AddRange(submission1, submission2, submission3);

                await _context.SaveChangesAsync();

                _logger.LogInformation("Database seeded successfully!");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error seeding database: {ex.Message}");
                throw;
            }
        }
    }
}
