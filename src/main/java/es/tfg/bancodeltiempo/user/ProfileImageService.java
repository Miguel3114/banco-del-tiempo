package es.tfg.bancodeltiempo.user;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProfileImageService {

    private static final long MAX_FILE_SIZE =
        5 * 1024 * 1024;

    private Path profileImagesDirectory;

    public ProfileImageService() {
        this.profileImagesDirectory =
            Paths.get(
                "uploads",
                "profile-images"
            );
    }

    public String saveProfileImage(
            MultipartFile file,
            Integer userId)
            throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                "Debes seleccionar una imagen"
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                "La imagen no puede superar los 5 MB"
            );
        }

        String extension =
            this.getExtension(file);

        Files.createDirectories(
            this.profileImagesDirectory
        );

        String fileName =
            "user-" +
            userId +
            "-" +
            UUID.randomUUID() +
            extension;

        Path destination =
            this.profileImagesDirectory
                .resolve(fileName);

        try (
            InputStream inputStream =
                file.getInputStream()
        ) {

            Files.copy(
                inputStream,
                destination,
                StandardCopyOption
                    .REPLACE_EXISTING
            );
        }

        return "/uploads/profile-images/" +
            fileName;
    }

    public void deleteProfileImage(
            String profileImageUrl)
            throws IOException {

        if (
            profileImageUrl == null ||
            profileImageUrl.isBlank()
        ) {
            return;
        }

        String fileName =
            Paths.get(profileImageUrl)
                .getFileName()
                .toString();

        Path imagePath =
            this.profileImagesDirectory
                .resolve(fileName);

        Files.deleteIfExists(
            imagePath
        );
    }

    private String getExtension(
            MultipartFile file) {

        String contentType =
            file.getContentType();

        if (
            "image/jpeg".equals(contentType)
        ) {
            return ".jpg";
        }

        if (
            "image/png".equals(contentType)
        ) {
            return ".png";
        }

        throw new IllegalArgumentException(
            "Solo se permiten imágenes JPG o PNG"
        );
    }
}