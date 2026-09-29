package es.tfg.bancodeltiempo.user;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

class ProfileImageServiceTest {

    @TempDir
    Path tempDir;

    private ProfileImageService profileImageService;

    @BeforeEach
    void setUp() {
        profileImageService =
                new ProfileImageService();

        ReflectionTestUtils.setField(
                profileImageService,
                "profileImagesDirectory",
                tempDir);
    }

    @Test
    void shouldSaveJpegImage()
            throws Exception {

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "profile.jpg",
                        "image/jpeg",
                        new byte[] { 1, 2, 3 });

        String imageUrl =
                profileImageService
                        .saveProfileImage(
                                file,
                                1);

        assertTrue(
                imageUrl.startsWith(
                        "/uploads/profile-images/user-1-"));
        assertTrue(imageUrl.endsWith(".jpg"));
        assertTrue(
                Files.exists(
                        tempDir.resolve(
                                Paths.get(imageUrl)
                                        .getFileName())));
    }

    @Test
    void shouldSavePngImage()
            throws Exception {

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "profile.png",
                        "image/png",
                        new byte[] { 1, 2, 3 });

        String imageUrl =
                profileImageService
                        .saveProfileImage(
                                file,
                                1);

        assertTrue(imageUrl.endsWith(".png"));
    }

    @Test
    void shouldRejectEmptyImage() {
        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "profile.jpg",
                        "image/jpeg",
                        new byte[0]);

        assertThrows(
                IllegalArgumentException.class,
                () -> profileImageService
                        .saveProfileImage(
                                file,
                                1));
    }

    @Test
    void shouldRejectImageLargerThanFiveMb() {
        MultipartFile file =
                mock(MultipartFile.class);

        when(file.isEmpty())
                .thenReturn(false);

        when(file.getSize())
                .thenReturn(
                        5L * 1024 * 1024 + 1);

        assertThrows(
                IllegalArgumentException.class,
                () -> profileImageService
                        .saveProfileImage(
                                file,
                                1));
    }

    @Test
    void shouldRejectUnsupportedImageType() {
        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "profile.gif",
                        "image/gif",
                        new byte[] { 1, 2, 3 });

        assertThrows(
                IllegalArgumentException.class,
                () -> profileImageService
                        .saveProfileImage(
                                file,
                                1));
    }

    @Test
    void shouldDeleteProfileImage()
            throws Exception {

        Path image =
                tempDir.resolve("old.jpg");

        Files.write(
                image,
                new byte[] { 1, 2, 3 });

        profileImageService.deleteProfileImage(
                "/uploads/profile-images/old.jpg");

        assertFalse(Files.exists(image));
    }

    @Test
    void shouldIgnoreMissingProfileImage()
            throws Exception {

        profileImageService.deleteProfileImage(
                null);

        profileImageService.deleteProfileImage(
                "   ");
    }
}
