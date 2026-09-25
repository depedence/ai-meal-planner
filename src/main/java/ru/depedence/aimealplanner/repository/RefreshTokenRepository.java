package ru.depedence.aimealplanner.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.depedence.aimealplanner.entity.RefreshToken;
import ru.depedence.aimealplanner.entity.User;

public interface RefreshTokenRepository
    extends JpaRepository<RefreshToken, Long>
{
    Optional<RefreshToken> findByToken(String token);
    void deleteByUser(User user);
    boolean existsByUser(User user);
}
