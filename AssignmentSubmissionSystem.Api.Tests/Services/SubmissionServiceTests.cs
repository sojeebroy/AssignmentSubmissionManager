using System;
using AssignmentSubmissionSystem.Api.Models.Dtos;
using AssignmentSubmissionSystem.Api.Models.Entities;
using AssignmentSubmissionSystem.Api.Models.Enums;
using AssignmentSubmissionSystem.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;


namespace AssignmentSubmissionSystem.Api.Tests.Services
{
    public class SubmissionServiceTests
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<ILogger<SubmissionService>> _loggerMock;
        private readonly SubmissionService _service;

        public SubmissionServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _loggerMock = new Mock<ILogger<SubmissionService>>();
            _service = new SubmissionService(_context, _loggerMock.Object);
        }

        private async Task SeedDataAsync()
        {
            var teacher = new User
            {
                Id = Guid.NewGuid(),
                Email = "teacher@test.com",
                FullName = "Test Teacher",
                PasswordHash = "hash",
                Role = UserRole.Teacher,
                IsActive = true
            };

            var subject = new Subject { Id = Guid.NewGuid(), Name = "Math", Code = "MTH101" };

            var @class = new ClassCourse
            {
                Id = Guid.NewGuid(),
                Name = "Class A",
                SubjectId = subject.Id,
                CreatedByAdminId = Guid.NewGuid()
            };

            var assignment = new Assignment
            {
                Id = Guid.NewGuid(),
                ClassId = @class.Id,
                TeacherId = teacher.Id,
                Title = "Test Assignment",
                Description = "Test Description",
                // Make the seeded assignment deadline far in the future so "before-deadline" tests are stable.
                DeadlineUtc = DateTime.UtcNow.AddYears(10),
                MaxMarks = 100,
                Status = AssignmentStatus.Published
            };

            _context.Users.Add(teacher);
            _context.Subjects.Add(subject);
            _context.Classes.Add(@class);
            _context.Assignments.Add(assignment);
            await _context.SaveChangesAsync();
        }

        [Fact]
        public async Task CreateAsync_WithValidData_ShouldCreateSubmission()
        {
            // Arrange
            await SeedDataAsync();
            var assignment = _context.Assignments.First();
            var studentId = Guid.NewGuid();
            var dto = new CreateSubmissionDto
            {
                AssignmentId = assignment.Id,
                AnswerContent = "Test Answer",
                AttachmentUrl = null
            };

            // Act
            var result = await _service.CreateAsync(studentId, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(assignment.Id, result.AssignmentId);
            Assert.Equal(studentId, result.StudentId);
            Assert.Equal("Test Answer", result.AnswerContent);
            Assert.Equal("Submitted", result.Status);
        }

        [Fact]
        public async Task CreateAsync_WithDuplicateSubmission_ShouldThrowException()
        {
            // Arrange
            await SeedDataAsync();
            var assignment = _context.Assignments.First();
            var studentId = Guid.NewGuid();
            var dto = new CreateSubmissionDto
            {
                AssignmentId = assignment.Id,
                AnswerContent = "Test Answer",
                AttachmentUrl = null
            };

            // Act
            await _service.CreateAsync(studentId, dto);

            // Assert
            await Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _service.CreateAsync(studentId, dto));
        }

        [Fact]
        public async Task CreateAsync_AfterDeadline_ShouldMarkAsLate()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var context = new ApplicationDbContext(options);

            var teacher = new User
            {
                Id = Guid.NewGuid(),
                Email = "teacher@test.com",
                FullName = "Test Teacher",
                PasswordHash = "hash",
                Role = UserRole.Teacher,
                IsActive = true
            };

            var subject = new Subject { Id = Guid.NewGuid(), Name = "Math" };
            var @class = new ClassCourse { Id = Guid.NewGuid(), Name = "Class A", SubjectId = subject.Id, CreatedByAdminId = Guid.NewGuid() };
            var assignment = new Assignment
            {
                Id = Guid.NewGuid(),
                ClassId = @class.Id,
                TeacherId = teacher.Id,
                Title = "Test Assignment",
                Description = "Test",
                DeadlineUtc = DateTime.UtcNow.AddHours(-1), // Past deadline (deterministic relative to runtime)
                MaxMarks = 100,
                Status = AssignmentStatus.Published
            };

            context.Users.Add(teacher);
            context.Subjects.Add(subject);
            context.Classes.Add(@class);
            context.Assignments.Add(assignment);
            await context.SaveChangesAsync();

            var service = new SubmissionService(context, new Mock<ILogger<SubmissionService>>().Object);
            var dto = new CreateSubmissionDto { AssignmentId = assignment.Id, AnswerContent = "Late Answer" };

            // Act
            var result = await service.CreateAsync(Guid.NewGuid(), dto);

            // Assert
            Assert.Equal("Late", result.Status);
        }

        [Fact]
        public async Task UpdateAsync_BeforeDeadline_ShouldUpdateSubmission()
        {
            // Arrange
            await SeedDataAsync();
            var assignment = _context.Assignments.First();
            var studentId = Guid.NewGuid();

            var submission = new Submission
            {
                Id = Guid.NewGuid(),
                AssignmentId = assignment.Id,
                StudentId = studentId,
                AnswerContent = "Original Answer",
                SubmittedAt = DateTime.UtcNow
            };

            _context.Submissions.Add(submission);
            await _context.SaveChangesAsync();

            var dto = new UpdateSubmissionDto
            {
                AnswerContent = "Updated Answer",
                AttachmentUrl = "https://example.com/file.pdf"
            };

            // Act
            var result = await _service.UpdateAsync(studentId, submission.Id, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Updated Answer", result.AnswerContent);
            Assert.Equal("https://example.com/file.pdf", result.AttachmentUrl);
        }

        [Fact]
        public async Task UpdateAsync_AfterDeadline_ShouldThrowException()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var context = new ApplicationDbContext(options);

            var teacher = new User
            {
                Id = Guid.NewGuid(),
                Email = "teacher@test.com",
                FullName = "Test Teacher",
                PasswordHash = "hash",
                Role = UserRole.Teacher,
                IsActive = true
            };

            var subject = new Subject { Id = Guid.NewGuid(), Name = "Math" };
            var @class = new ClassCourse { Id = Guid.NewGuid(), Name = "Class A", SubjectId = subject.Id, CreatedByAdminId = Guid.NewGuid() };
            var assignment = new Assignment
            {
                Id = Guid.NewGuid(),
                ClassId = @class.Id,
                TeacherId = teacher.Id,
                Title = "Test Assignment",
                Description = "Test",
                DeadlineUtc = DateTime.UtcNow.AddHours(-1), // Past deadline
                MaxMarks = 100,
                Status = AssignmentStatus.Published
            };

            context.Users.Add(teacher);
            context.Subjects.Add(subject);
            context.Classes.Add(@class);
            context.Assignments.Add(assignment);

            var studentId = Guid.NewGuid();
            var submission = new Submission
            {
                Id = Guid.NewGuid(),
                AssignmentId = assignment.Id,
                StudentId = studentId,
                AnswerContent = "Original",
                SubmittedAt = DateTime.UtcNow.AddHours(-2)
            };

            context.Submissions.Add(submission);
            await context.SaveChangesAsync();

            var service = new SubmissionService(context, new Mock<ILogger<SubmissionService>>().Object);
            var dto = new UpdateSubmissionDto { AnswerContent = "Updated" };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await service.UpdateAsync(studentId, submission.Id, dto));
        }

        [Fact]
        public async Task GetForStudentAsync_ShouldReturnStudentSubmissions()
        {
            // Arrange
            await SeedDataAsync();
            var assignment = _context.Assignments.First();
            var studentId = Guid.NewGuid();

            var submission1 = new Submission
            {
                Id = Guid.NewGuid(),
                AssignmentId = assignment.Id,
                StudentId = studentId,
                AnswerContent = "Answer 1",
                SubmittedAt = DateTime.UtcNow.AddHours(-2)
            };

            var submission2 = new Submission
            {
                Id = Guid.NewGuid(),
                AssignmentId = assignment.Id,
                StudentId = studentId,
                AnswerContent = "Answer 2",
                SubmittedAt = DateTime.UtcNow.AddHours(-1)
            };

            _context.Submissions.AddRange(submission1, submission2);
            await _context.SaveChangesAsync();

            // Act
            var results = await _service.GetForStudentAsync(studentId);

            // Assert
            Assert.NotEmpty(results);
            Assert.Equal(2, results.Count());
        }
    }
}