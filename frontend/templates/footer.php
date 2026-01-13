 <!-- jQuery and cookie lib (must be before your scripts) -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"
        integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js"></script>

    <!-- Configuration -->
    <script src="js/config.js?v=<?= time() ?>"></script>

    <!-- Your shared sounds, utils -->
    <script src="js/utils.js"></script>
    <script src="js/sounds.js"></script>
    <!-- <script src="js/presence.js"></script> -->

    <!-- <script src="js/rooms/colosseum.js"></script> -->

    <!-- Core game engine -->
    <script src="js/gameEngine.js"></script>

    <!-- Each game type -->
    <script src="js/games/spectator.js"></script>
    <script src="js/games/classicGame.js"></script>
    <script src="js/games/challengeGame.js"></script>
    <script src="js/games/battleGame.js"></script>

    <!-- Entry point -->
    <script src="js/main.js"></script>

    <!-- Legal Footer -->
    <div class="legal-footer">
        <a href="/terms.php">Terms of Use</a>
        <span style="opacity: 0.5;">|</span>
        <a href="/privacy.php">Privacy Policy</a>
    </div>
</body>

</html>