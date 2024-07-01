DROP FUNCTION IF EXISTS getPrice;
DROP FUNCTION IF EXISTS getPreviousPrice;
DROP FUNCTION IF EXISTS getSizes;
DROP PROCEDURE IF EXISTS register;

DELIMITER /
CREATE FUNCTION getPrice(id BIGINT UNSIGNED) RETURNS FLOAT DETERMINISTIC
BEGIN
    DECLARE lastPrice FLOAT;

    SELECT price INTO lastPrice
    FROM priceHistory
    WHERE priceHistory.id = id
    ORDER BY changed DESC
    LIMIT 1;
    IF lastPrice IS NULL THEN
        SET lastPrice = -1;
    END IF;

    RETURN lastPrice;
END/

CREATE FUNCTION getPreviousPrice(id BIGINT UNSIGNED) RETURNS FLOAT DETERMINISTIC
BEGIN
    DECLARE prevPrice FLOAT;

    SELECT price INTO prevPrice
    FROM priceHistory
    WHERE priceHistory.id = id
    ORDER BY changed DESC
    LIMIT 1, 1;

    RETURN prevPrice;
END/

CREATE FUNCTION getSizes(id BIGINT UNSIGNED) RETURNS JSON DETERMINISTIC
BEGIN
    DECLARE result JSON;

    SELECT JSON_ARRAYAGG(JSON_OBJECT('id', s.id, 'title', s.title))
    INTO result
    FROM sizes
    JOIN size s ON s.id = sizes.sizeID
    WHERE sizes.productID = id;

    IF result IS NULL THEN
        SET result = JSON_ARRAY();
    END IF;

    RETURN result;
END/

CREATE PROCEDURE register(login TINYTEXT, passwd VARCHAR(256))
BEGIN
	INSERT INTO worker(login) VALUE(login);
    INSERT INTO userSecret(password) VALUE(SHA2(passwd, 256));
    SELECT 1;
END/
DELIMITER ;
