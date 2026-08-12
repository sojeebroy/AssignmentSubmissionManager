using AssignmentSubmissionSystem.Api.Models.Dtos;
using AssignmentSubmissionSystem.Api.Models.Entities;
using AssignmentSubmissionSystem.Api.Models.Enums;
using AssignmentSubmissionSystem.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace AssignmentSubmissionSystem.Api.Tests.Services
    { 

    public class GradingServiceTests
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<ILogger<GradingService>> _loggerMock;
        private readonly GradingService _service;

        public GradingServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _loggerMock = new Mock<ILogger<GradingService>>();
            _service = new GradingService(_context, _loggerMock.Object);
        }

        private async Task<(Guid TeacherId, Guid AssignmentId, Guid SubmissionId, Guid StudentId)> SeedDataAsync()
        {
            var teacherId = Guid.NewGuid();
            var studentId = Guid.NewGuid();
            var subjectId = Guid.NewGuid();
            var classId = Guid.NewGuid();
            var assignmentId = Guid.NewGuid();
            var submissionId = Guid.NewGuid();

            var teacher = new User
            {
                Id = teacherId,
                Email = "teacher@test.com",
                FullName = "Test Teacher",
                PasswordHash = "hash",
                Role = UserRole.Teacher,
                IsActive = true
            };

            var student = new User
            {
                Id = studentId,
                Email = "student@test.com",
                FullName = "Test Student",
                PasswordHash = "hash",
                Role = UserRole.Student,
                IsActive = true
            };

            var subject = new Subject { Id = subjectId, Name = "Math", Code = "MTH101" };

            var @class = new ClassCourse
            {
                Id = classId,
                Name = "Class A",
                SubjectId = subjectId,
                CreatedByAdminId = Guid.NewGuid()
            };

            var assignment = new Assignment
            {
                Id = assignmentId,
                ClassId = classId,
                TeacherId = teacherId,
                Title = "Test Assignment",
                Description = "Test Description",
                DeadlineUtc = DateTime.UtcNow.AddDays(7),
                MaxMarks = 100,
                Status = AssignmentStatus.Published
            };

            var submission = new Submission
            {
                Id = submissionId,
                AssignmentId = assignmentId,
                StudentId = studentId,
                AnswerContent = "Student Answer",
                SubmittedAt = DateTime.UtcNow.AddHours(-1),
                Status = SubmissionStatus.Submitted
            };

            _context.Users.AddRange(teacher, student);
            _context.Subjects.Add(subject);
            _context.Classes.Add(@class);
            _context.Assignments.Add(assignment);
            _context.Submissions.Add(submission);
            await _context.SaveChangesAsync();

            return (teacherId, assignmentId, submissionId, studentId);
        }

        [Fact]
        public async Task GetSubmissionsForAssignmentAsync_WithValidTeacher_ShouldReturnSubmissions()
        {
            // Arrange
            var (teacherId, assignmentId, _, _) = await SeedDataAsync();

            // Act
            var results = await _service.GetSubmissionsForAssignmentAsync(teacherId, assignmentId);

            // Assert
            Assert.NotEmpty(results);
            Assert.Single(results);
        }

        [Fact]
        public async Task GetSubmissionsForAssignmentAsync_WithUnauthorizedTeacher_ShouldThrowException()
        {
            // Arrange
            var (_, assignmentId, _, _) = await SeedDataAsync();
            var unauthorizedTeacherId = Guid.NewGuid();

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
                await _service.GetSubmissionsForAssignmentAsync(unauthorizedTeacherId, assignmentId));
        }

        [Fact]
        public async Task GetSubmissionAsync_WithValidTeacher_ShouldReturnSubmission()
        {
            // Arrange
            var (teacherId, _, submissionId, _) = await SeedDataAsync();

            // Act
            var result = await _service.GetSubmissionAsync(teacherId, submissionId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(submissionId, result.Id);
        }

        [Fact]
        public async Task GetSubmissionAsync_WithUnauthorizedTeacher_ShouldThrowException()
        {
            // Arrange
            var (_, _, submissionId, _) = await SeedDataAsync();
            var unauthorizedTeacherId = Guid.NewGuid();

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
                await _service.GetSubmissionAsync(unauthorizedTeacherId, submissionId));
        }

        [Fact]
        public async Task SubmitGradeAsync_WithValidData_ShouldGradeSubmission()
        {
            // Arrange
            var (teacherId, _, submissionId, _) = await SeedDataAsync();
            var dto = new SubmitGradeDto
            {
                Marks = 85.5m,
                Feedback = "Good work!"
            };

            // Act
            var result = await _service.SubmitGradeAsync(teacherId, submissionId, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(85.5m, result.Marks);
            Assert.Equal("Good work!", result.Feedback);
            Assert.Equal("Graded", result.Status);
            Assert.NotNull(result.GradedAt);
        }

        [Fact]
        public async Task SubmitGradeAsync_WithMarksExceedingMax_ShouldThrowException()
        {
            // Arrange
            var (teacherId, _, submissionId, _) = await SeedDataAsync();
            var dto = new SubmitGradeDto
            {
                Marks = 150m, // Exceeds max of 100
                Feedback = "Too many marks"
            };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _service.SubmitGradeAsync(teacherId, submissionId, dto));
        }

        [Fact]
        public async Task SubmitGradeAsync_WithNegativeMarks_ShouldThrowException()
        {
            // Arrange
            var (teacherId, _, submissionId, _) = await SeedDataAsync();
            var dto = new SubmitGradeDto
            {
                Marks = -10m, // Negative marks
                Feedback = "Invalid"
            };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _service.SubmitGradeAsync(teacherId, submissionId, dto));
        }

        [Fact]
        public async Task SubmitGradeAsync_WithUnauthorizedTeacher_ShouldThrowException()
        {
            // Arrange
            var (_, _, submissionId, _) = await SeedDataAsync();
            var unauthorizedTeacherId = Guid.NewGuid();
            var dto = new SubmitGradeDto { Marks = 50m, Feedback = "Test" };

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
                await _service.SubmitGradeAsync(unauthorizedTeacherId, submissionId, dto));
        }
    }
}