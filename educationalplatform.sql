-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 16, 2025 at 04:35 PM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `educationalplatform`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `AddCourseWithSection` (IN `p_course_name` VARCHAR(100), IN `p_description` TEXT, IN `p_teacher_id` INT, IN `p_section_id` INT, IN `p_academic_year` VARCHAR(20))   BEGIN
    INSERT INTO Courses (CourseName, Description, TeacherID, SectionID, AcademicYear)
    VALUES (p_course_name, p_description, p_teacher_id, p_section_id, p_academic_year);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `AddStudentWithSection` (IN `p_username` VARCHAR(100), IN `p_password` VARCHAR(255), IN `p_email` VARCHAR(100), IN `p_section_id` INT, IN `p_academic_year` VARCHAR(20))   BEGIN
    INSERT INTO Users (Username, Password, Email, Role, SectionID, AcademicYear)
    VALUES (p_username, p_password, p_email, 'Student', p_section_id, p_academic_year);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `EnrollStudentWithSection` (IN `p_student_id` INT, IN `p_course_id` INT, IN `p_section_id` INT, IN `p_academic_year` VARCHAR(20))   BEGIN
    INSERT INTO Enrollments (StudentID, CourseID, SectionID, AcademicYear)
    VALUES (p_student_id, p_course_id, p_section_id, p_academic_year);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `CourseID` int NOT NULL,
  `CourseName` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `Description` text COLLATE utf8mb4_general_ci,
  `TeacherID` int NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `urlIMG` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `SectionID` int DEFAULT NULL,
  `AcademicYear` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`CourseID`, `CourseName`, `Description`, `TeacherID`, `CreatedAt`, `urlIMG`, `SectionID`, `AcademicYear`) VALUES
(1, 'Mathematics 101', 'Introduction to Mathematics', 2, '2025-03-18 18:40:41', './IMG/math.jpg\n', 48, ''),
(7, 'C++', 'programming', 2, '2025-04-13 22:16:14', './IMG/math.jpg', 48, ''),
(10, 'Python', 'programming ', 2, '2025-04-24 17:26:16', NULL, 48, '2025-2024'),
(11, 'english', 'from 0 level', 20, '2025-05-13 19:44:01', './IMG/2.png', 48, NULL),
(20, 'Hamilton Edwards', 'Fugiat corrupti mi', 20, '2025-05-18 16:44:22', NULL, 48, NULL),
(52, 'Dylan Hoffman', 'Quisquam dolores tem', 20, '2025-05-19 19:12:06', './IMG1747681926_wavy-black-white-background.png', 48, NULL),
(53, 'Kellie Beach', 'Qui omnis dignissimo', 20, '2025-05-19 19:12:25', './IMG1747681945_Capture.PNG', 48, NULL),
(54, 'Joan Owen', 'Debitis sed consequu', 20, '2025-05-20 12:37:23', './IMG/1747744643_015c9f7a-fc96-4245-a4bd-0fb1bcd4e17c_rwc_975x0x2105x410x3200.png', 48, NULL),
(55, 'Idola Chavez', 'Adipisci sequi quia ', 20, '2025-05-20 12:38:27', './IMG/1747744707_015c9f7a-fc96-4245-a4bd-0fb1bcd4e17c_rwc_975x0x2105x410x3200.png', 48, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `EnrollmentID` int NOT NULL,
  `StudentID` int NOT NULL,
  `CourseID` int NOT NULL,
  `EnrolledAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `SectionID` int DEFAULT NULL,
  `AcademicYear` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `enrollments`
--

INSERT INTO `enrollments` (`EnrollmentID`, `StudentID`, `CourseID`, `EnrolledAt`, `SectionID`, `AcademicYear`) VALUES
(1, 3, 1, '2025-03-18 18:50:00', NULL, NULL),
(4, 3, 7, '2025-04-24 17:23:08', NULL, NULL),
(5, 22, 10, '2025-06-16 15:28:02', 48, '2025-2024'),
(6, 22, 7, '2025-06-16 15:28:04', 48, ''),
(7, 22, 1, '2025-06-16 15:28:09', 48, ''),
(8, 22, 11, '2025-06-16 15:38:16', 48, NULL),
(9, 23, 11, '2025-06-16 16:32:39', 48, NULL),
(10, 23, 1, '2025-06-16 16:32:41', 48, '');

-- --------------------------------------------------------

--
-- Table structure for table `examanswers`
--

CREATE TABLE `examanswers` (
  `AnswerID` int NOT NULL,
  `QuestionID` int NOT NULL,
  `AnswerText` text COLLATE utf8mb4_general_ci NOT NULL,
  `IsCorrect` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `examanswers`
--

INSERT INTO `examanswers` (`AnswerID`, `QuestionID`, `AnswerText`, `IsCorrect`) VALUES
(4, 3, '12', 1),
(5, 3, '11', 0),
(6, 4, 'x = 3', 1),
(7, 4, 'x = 4', 0),
(54, 28, '14', 1),
(55, 28, '4', 0),
(56, 29, '8', 1),
(57, 29, '5', 0),
(58, 30, '5', 1),
(59, 30, '1', 0),
(60, 31, '6', 1),
(61, 31, '5', 0);

-- --------------------------------------------------------

--
-- Table structure for table `examquestions`
--

CREATE TABLE `examquestions` (
  `QuestionID` int NOT NULL,
  `ExamID` int NOT NULL,
  `QuestionText` text COLLATE utf8mb4_general_ci NOT NULL,
  `correctAnswer` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `examquestions`
--

INSERT INTO `examquestions` (`QuestionID`, `ExamID`, `QuestionText`, `correctAnswer`) VALUES
(3, 2, 'What is 5+7?', '12'),
(4, 2, 'Solve for x: 3x - 2 = 7', '3'),
(28, 15, '7+7', '14'),
(29, 15, '5+3', '8'),
(30, 15, '2+3', '5'),
(31, 15, '4+2', '6');

-- --------------------------------------------------------

--
-- Table structure for table `examresults`
--

CREATE TABLE `examresults` (
  `ExamResultID` int NOT NULL,
  `StudentID` int NOT NULL,
  `ExamID` int NOT NULL,
  `Score` int DEFAULT NULL,
  `TakenAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `examresults`
--

INSERT INTO `examresults` (`ExamResultID`, `StudentID`, `ExamID`, `Score`, `TakenAt`) VALUES
(6, 3, 2, 100, '2025-04-05 20:20:25'),
(7, 22, 2, 50, '2025-06-16 15:31:31'),
(14, 22, 15, 75, '2025-06-16 16:29:34'),
(15, 23, 15, 75, '2025-06-16 16:33:00'),
(16, 23, 2, 50, '2025-06-16 16:33:43');

-- --------------------------------------------------------

--
-- Table structure for table `exams`
--

CREATE TABLE `exams` (
  `ExamID` int NOT NULL,
  `CourseID` int NOT NULL,
  `ExamName` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Duration` varchar(50) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exams`
--

INSERT INTO `exams` (`ExamID`, `CourseID`, `ExamName`, `CreatedAt`, `Duration`) VALUES
(2, 1, 'Math Midterm Exam', '2025-03-15 08:00:00', '1.5 hours'),
(15, 11, 'math2', '2025-06-16 16:29:06', '60');

-- --------------------------------------------------------

--
-- Table structure for table `lessons`
--

CREATE TABLE `lessons` (
  `LessonID` int NOT NULL,
  `CourseID` int NOT NULL,
  `LessonName` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `Content` text COLLATE utf8mb4_general_ci,
  `VideoURL` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Duration` varchar(20) COLLATE utf8mb4_general_ci DEFAULT '30m'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lessons`
--

INSERT INTO `lessons` (`LessonID`, `CourseID`, `LessonName`, `Content`, `VideoURL`, `CreatedAt`, `Duration`) VALUES
(1, 1, 'Lesson 1: Algebra Basics', 'Introduction to Algebra', 'https://www.youtube.com/watch?v=akMDI4KIh_w', '2025-03-18 19:00:00', '15m'),
(2, 1, 'Lesson 2: Linear Equations', 'Solving linear equations', 'http://example.com/video2', '2025-03-18 19:30:00', '30m'),
(8, 10, 'intro', 'vvvv', 'dddd', '2025-04-24 18:29:13', '30');

-- --------------------------------------------------------

--
-- Table structure for table `lesson_progress`
--

CREATE TABLE `lesson_progress` (
  `ProgressID` int NOT NULL,
  `StudentID` int NOT NULL,
  `LessonID` int NOT NULL,
  `CompletedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lesson_progress`
--

INSERT INTO `lesson_progress` (`ProgressID`, `StudentID`, `LessonID`, `CompletedAt`) VALUES
(1, 3, 1, '2025-04-13 21:39:27'),
(7, 22, 1, '2025-06-16 15:28:34'),
(8, 22, 2, '2025-06-16 15:28:47');

-- --------------------------------------------------------

--
-- Table structure for table `profiles`
--

CREATE TABLE `profiles` (
  `ProfileID` int NOT NULL,
  `UserID` int NOT NULL,
  `FullName` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Bio` text COLLATE utf8mb4_general_ci,
  `ProfilePictureURL` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `profiles`
--

INSERT INTO `profiles` (`ProfileID`, `UserID`, `FullName`, `Bio`, `ProfilePictureURL`) VALUES
(1, 2, 'Mekkawy', 'A passionate teacher with a focus on mathematics.', 'http://example.com/mekkawy.jpg'),
(2, 3, 'Alaa', 'A student passionate about learning.', 'uploads/profiles/3_1743863329_perfil.png'),
(4, 20, 'amir fouda', 'hello this is test', '2.png'),
(5, 21, 'Maxwell Wynn', 'Aut sed sint rerum q', 'logo.png');

-- --------------------------------------------------------

--
-- Table structure for table `quizanswers`
--

CREATE TABLE `quizanswers` (
  `AnswerID` int NOT NULL,
  `QuestionID` int NOT NULL,
  `AnswerText` text COLLATE utf8mb4_general_ci NOT NULL,
  `IsCorrect` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quizanswers`
--

INSERT INTO `quizanswers` (`AnswerID`, `QuestionID`, `AnswerText`, `IsCorrect`) VALUES
(1, 1, 'x = (-b ± √(b²-4ac)) / 2a', 1),
(2, 1, 'x = -b ± √(b² - 4ac)', 1),
(3, 2, 'Algebra is about solving for unknowns.', 1),
(6, 4, '1', 0),
(7, 4, '2', 0),
(8, 4, '3', 0),
(9, 4, '4', 1);

-- --------------------------------------------------------

--
-- Table structure for table `quizquestions`
--

CREATE TABLE `quizquestions` (
  `QuestionID` int NOT NULL,
  `QuizID` int NOT NULL,
  `QuestionText` text COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quizquestions`
--

INSERT INTO `quizquestions` (`QuestionID`, `QuizID`, `QuestionText`) VALUES
(1, 1, 'What is the formula for solving linear equations?'),
(2, 1, 'What is the first principle of algebra?'),
(4, 7, '2+2=?');

-- --------------------------------------------------------

--
-- Table structure for table `quizresults`
--

CREATE TABLE `quizresults` (
  `QuizResultID` int NOT NULL,
  `StudentID` int NOT NULL,
  `QuizID` int NOT NULL,
  `Score` int DEFAULT NULL,
  `TakenAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quizresults`
--

INSERT INTO `quizresults` (`QuizResultID`, `StudentID`, `QuizID`, `Score`, `TakenAt`) VALUES
(7, 3, 1, 100, '2025-04-13 21:39:27'),
(8, 22, 1, 100, '2025-06-16 15:28:34'),
(9, 22, 7, 0, '2025-06-16 15:28:47');

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `QuizID` int NOT NULL,
  `LessonID` int NOT NULL,
  `QuizName` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quizzes`
--

INSERT INTO `quizzes` (`QuizID`, `LessonID`, `QuizName`, `CreatedAt`) VALUES
(1, 1, 'Algebra Basics Quiz', '2025-03-18 17:15:00'),
(2, 2, 'Linear Equations Quiz', '2025-03-18 17:45:00'),
(7, 2, 'math', '2025-04-21 23:09:39');

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `SectionID` int NOT NULL,
  `SectionName` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `GradeLevel` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `AcademicYear` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`SectionID`, `SectionName`, `GradeLevel`, `AcademicYear`, `CreatedAt`) VALUES
(48, '1', 'الصف الأول', '2024-2025', '2025-04-24 17:13:02');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `UserID` int NOT NULL,
  `Username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `Password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `Role` enum('Student','Teacher','Admin') COLLATE utf8mb4_general_ci NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `SectionID` int DEFAULT NULL,
  `AcademicYear` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`UserID`, `Username`, `Password`, `Email`, `Role`, `CreatedAt`, `SectionID`, `AcademicYear`) VALUES
(2, 'Mekkawy', '$2y$10$IZ2IzC9LtX4gli1XJsM/Tu.qTrjc/Uy6wW/GXWEAwpqqQ3ytSHo02', 'Mekk@gmail.com', 'Teacher', '2025-03-18 20:40:41', NULL, NULL),
(3, 'Alaa', '$2y$10$WojSQRXDZdyeiRo81gtLfel6oKV/eHDW5JKPdylrAUhFJHaHs6n1G', 'alaa@gmail.com', 'Student', '2025-03-18 20:48:24', 48, '2024-2025'),
(17, 'admin', '$2y$10$JeXt1.fKodDEPzGuc6XB8OBfUDXL9SCmEpa16YMMxvWu6maFiYH2m', 'admin@gmail.com', 'Admin', '2025-04-13 19:41:58', NULL, NULL),
(20, 'amir', '$2y$10$6xIvFCcF8rIibQOxhF8gb.k0bsxNTwTecbMvi.LYktEpkmUCFgGfy', 'amir@mail.com', 'Teacher', '2025-05-13 14:40:22', NULL, NULL),
(21, 'qecav', '$2y$10$72H2xvsNGCvX0qpK/fz1nO4VIwLi1rX77gsi0bsbxmZ9Rq/iMPSTi', 'vipo@mailinator.com', 'Student', '2025-05-16 13:08:28', 48, '2024-2025'),
(22, 'amirhafez', '$2y$10$V8BJxs2/U.o/T1qSPwTJqeGrIxB/Tp2yXGzEi.pARnZV3uc3QbE2C', 'amir22@mail.com', 'Student', '2025-06-16 15:27:39', 48, '2024-2025'),
(23, 'amirhafez5', '$2y$10$h1Mla/R4tM7cUM2nNFGA4Owozp2YwjO5yYUb2rMXCjQbJjLJ8CGSC', 'amir33@mail.com', 'Student', '2025-06-16 16:32:23', 48, '2024-2025');

--
-- Triggers `users`
--
DELIMITER $$
CREATE TRIGGER `UpdateEnrollmentAcademicYear` AFTER UPDATE ON `users` FOR EACH ROW BEGIN
    IF NEW.AcademicYear != OLD.AcademicYear THEN
        UPDATE Enrollments 
        SET AcademicYear = NEW.AcademicYear 
        WHERE StudentID = NEW.UserID;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `UpdateEnrollmentSection` AFTER UPDATE ON `users` FOR EACH ROW BEGIN
    IF NEW.SectionID != OLD.SectionID THEN
        UPDATE Enrollments 
        SET SectionID = NEW.SectionID 
        WHERE StudentID = NEW.UserID;
    END IF;
END
$$
DELIMITER ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`CourseID`),
  ADD KEY `TeacherID` (`TeacherID`),
  ADD KEY `SectionID` (`SectionID`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`EnrollmentID`),
  ADD KEY `StudentID` (`StudentID`),
  ADD KEY `CourseID` (`CourseID`),
  ADD KEY `SectionID` (`SectionID`);

--
-- Indexes for table `examanswers`
--
ALTER TABLE `examanswers`
  ADD PRIMARY KEY (`AnswerID`),
  ADD KEY `QuestionID` (`QuestionID`);

--
-- Indexes for table `examquestions`
--
ALTER TABLE `examquestions`
  ADD PRIMARY KEY (`QuestionID`),
  ADD KEY `ExamID` (`ExamID`);

--
-- Indexes for table `examresults`
--
ALTER TABLE `examresults`
  ADD PRIMARY KEY (`ExamResultID`),
  ADD KEY `StudentID` (`StudentID`),
  ADD KEY `ExamID` (`ExamID`);

--
-- Indexes for table `exams`
--
ALTER TABLE `exams`
  ADD PRIMARY KEY (`ExamID`),
  ADD KEY `CourseID` (`CourseID`);

--
-- Indexes for table `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`LessonID`),
  ADD KEY `CourseID` (`CourseID`);

--
-- Indexes for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD PRIMARY KEY (`ProgressID`),
  ADD UNIQUE KEY `unique_student_lesson` (`StudentID`,`LessonID`),
  ADD KEY `LessonID` (`LessonID`);

--
-- Indexes for table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`ProfileID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indexes for table `quizanswers`
--
ALTER TABLE `quizanswers`
  ADD PRIMARY KEY (`AnswerID`),
  ADD KEY `QuestionID` (`QuestionID`);

--
-- Indexes for table `quizquestions`
--
ALTER TABLE `quizquestions`
  ADD PRIMARY KEY (`QuestionID`),
  ADD KEY `QuizID` (`QuizID`);

--
-- Indexes for table `quizresults`
--
ALTER TABLE `quizresults`
  ADD PRIMARY KEY (`QuizResultID`),
  ADD KEY `StudentID` (`StudentID`),
  ADD KEY `QuizID` (`QuizID`);

--
-- Indexes for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`QuizID`),
  ADD KEY `LessonID` (`LessonID`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`SectionID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Username` (`Username`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD KEY `SectionID` (`SectionID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `CourseID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `EnrollmentID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `examanswers`
--
ALTER TABLE `examanswers`
  MODIFY `AnswerID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `examquestions`
--
ALTER TABLE `examquestions`
  MODIFY `QuestionID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `examresults`
--
ALTER TABLE `examresults`
  MODIFY `ExamResultID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `exams`
--
ALTER TABLE `exams`
  MODIFY `ExamID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `lessons`
--
ALTER TABLE `lessons`
  MODIFY `LessonID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  MODIFY `ProgressID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `profiles`
--
ALTER TABLE `profiles`
  MODIFY `ProfileID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `quizanswers`
--
ALTER TABLE `quizanswers`
  MODIFY `AnswerID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `quizquestions`
--
ALTER TABLE `quizquestions`
  MODIFY `QuestionID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `quizresults`
--
ALTER TABLE `quizresults`
  MODIFY `QuizResultID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `QuizID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `SectionID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `UserID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`TeacherID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE,
  ADD CONSTRAINT `courses_ibfk_2` FOREIGN KEY (`SectionID`) REFERENCES `sections` (`SectionID`);

--
-- Constraints for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`StudentID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`CourseID`) REFERENCES `courses` (`CourseID`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollments_ibfk_3` FOREIGN KEY (`SectionID`) REFERENCES `sections` (`SectionID`);

--
-- Constraints for table `examanswers`
--
ALTER TABLE `examanswers`
  ADD CONSTRAINT `examanswers_ibfk_1` FOREIGN KEY (`QuestionID`) REFERENCES `examquestions` (`QuestionID`) ON DELETE CASCADE;

--
-- Constraints for table `examquestions`
--
ALTER TABLE `examquestions`
  ADD CONSTRAINT `examquestions_ibfk_1` FOREIGN KEY (`ExamID`) REFERENCES `exams` (`ExamID`) ON DELETE CASCADE;

--
-- Constraints for table `examresults`
--
ALTER TABLE `examresults`
  ADD CONSTRAINT `examresults_ibfk_1` FOREIGN KEY (`StudentID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE,
  ADD CONSTRAINT `examresults_ibfk_2` FOREIGN KEY (`ExamID`) REFERENCES `exams` (`ExamID`) ON DELETE CASCADE;

--
-- Constraints for table `exams`
--
ALTER TABLE `exams`
  ADD CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`CourseID`) REFERENCES `courses` (`CourseID`) ON DELETE CASCADE;

--
-- Constraints for table `lessons`
--
ALTER TABLE `lessons`
  ADD CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`CourseID`) REFERENCES `courses` (`CourseID`) ON DELETE CASCADE;

--
-- Constraints for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD CONSTRAINT `lesson_progress_ibfk_1` FOREIGN KEY (`StudentID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE,
  ADD CONSTRAINT `lesson_progress_ibfk_2` FOREIGN KEY (`LessonID`) REFERENCES `lessons` (`LessonID`) ON DELETE CASCADE;

--
-- Constraints for table `profiles`
--
ALTER TABLE `profiles`
  ADD CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE;

--
-- Constraints for table `quizanswers`
--
ALTER TABLE `quizanswers`
  ADD CONSTRAINT `quizanswers_ibfk_1` FOREIGN KEY (`QuestionID`) REFERENCES `quizquestions` (`QuestionID`) ON DELETE CASCADE;

--
-- Constraints for table `quizquestions`
--
ALTER TABLE `quizquestions`
  ADD CONSTRAINT `quizquestions_ibfk_1` FOREIGN KEY (`QuizID`) REFERENCES `quizzes` (`QuizID`) ON DELETE CASCADE;

--
-- Constraints for table `quizresults`
--
ALTER TABLE `quizresults`
  ADD CONSTRAINT `quizresults_ibfk_1` FOREIGN KEY (`StudentID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE,
  ADD CONSTRAINT `quizresults_ibfk_2` FOREIGN KEY (`QuizID`) REFERENCES `quizzes` (`QuizID`) ON DELETE CASCADE;

--
-- Constraints for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`LessonID`) REFERENCES `lessons` (`LessonID`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`SectionID`) REFERENCES `sections` (`SectionID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
