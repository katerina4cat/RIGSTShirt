DROP FUNCTION IF EXISTS getPrice;
DROP FUNCTION IF EXISTS getPreviousPrice;
DROP FUNCTION IF EXISTS getSizes;
DROP FUNCTION IF EXISTS getOrderProducts;
DROP FUNCTION IF EXISTS checkClientSale;
DROP FUNCTION IF EXISTS checkClientSaleByPhone;
DROP FUNCTION IF EXISTS getOrderStatus;
DROP FUNCTION IF EXISTS getOrderDelivery;
DROP FUNCTION IF EXISTS getClientInfo;
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


CREATE FUNCTION getClientInfo(clientID BIGINT UNSIGNED) RETURNS JSON DETERMINISTIC
BEGIN
    DECLARE result JSON;

    SELECT JSON_OBJECT('id', s.id, 'uuid', s.uuid, 'name', s.name, 'surname', s.surname, "lastname", s.lastname, "phone", s.phone, "email", s.email, "sale", checkClientSale(s.id))
    INTO result
    FROM clientInfo s
    WHERE s.id = clientID;

    RETURN result;
END/

CREATE PROCEDURE register(login TINYTEXT, passwd VARCHAR(256))
BEGIN
	INSERT INTO worker(login) VALUE(login);
    INSERT INTO userSecret(password) VALUE(SHA2(passwd, 256));
    SELECT 1;
END/


CREATE FUNCTION getOrderProducts(orderID BIGINT UNSIGNED, orderDate TIMESTAMP)
RETURNS JSON DETERMINISTIC
BEGIN
    DECLARE result JSON;
    SET result = (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', product.id,
                'title', product.title,
                'description', product.description,
                'deleted', product.deleted,
                'size', size.title,
                'count', orderPosition.count,
                'price', (
                    SELECT ph.price
                    FROM priceHistory ph
                    WHERE ph.id = product.id
                    AND ph.changed <= orderDate
                    ORDER BY ph.changed DESC
                    LIMIT 1
                )
            )
        )
        FROM `order`
        JOIN `orderPosition` ON `order`.id = `orderPosition`.orderID
        JOIN `product` ON `product`.id = `orderPosition`.productID
        JOIN `size` ON `orderPosition`.sizeID = `size`.id
        WHERE `order`.id = orderID
    );
    RETURN result;
END /

CREATE FUNCTION checkClientSale(clientID BIGINT UNSIGNED)
RETURNS BOOLEAN DETERMINISTIC
BEGIN
    DECLARE completedOrders INT;
    
    SELECT COUNT(*) INTO completedOrders
    FROM `order`
    JOIN statusHistory sh ON `order`.id = sh.orderID
    WHERE `order`.clientID = clientID AND sh.statusID = 200;
    
    RETURN completedOrders > 10;
END /

CREATE FUNCTION checkClientSaleByPhone(phone BIGINT UNSIGNED)
RETURNS BOOLEAN DETERMINISTIC
BEGIN
    DECLARE clientID BIGINT UNSIGNED;
    DECLARE completedOrders INT;
    
    SELECT `id` INTO clientID
    FROM `clientInfo`
    WHERE `phone` = phone;
    
    SELECT COUNT(*) INTO completedOrders
    FROM `order`
    JOIN statusHistory sh ON `order`.id = sh.orderID
    WHERE `order`.clientID = clientID AND sh.statusID = 200;
    
    RETURN completedOrders > 10;
END /

CREATE FUNCTION getOrderStatus(orderID BIGINT UNSIGNED)
RETURNS TINYTEXT DETERMINISTIC
BEGIN
    DECLARE result TINYTEXT;
    SELECT title INTO result
                FROM statusHistory sh
                JOIN statusList sl ON sl.id = sh.statusID
                WHERE sh.orderID = orderID
                ORDER BY sh.changed DESC
                LIMIT 1;
    RETURN result;
END /

CREATE FUNCTION getOrderDelivery(orderID BIGINT UNSIGNED)
RETURNS JSON DETERMINISTIC
BEGIN
    DECLARE result JSON;
    SELECT JSON_OBJECT(
		"id", id,
		"latitude", latitude,
		"longitude", longitude,
		"entrance", entrance,
		"apartment", apartment,
		"description", description
    ) INTO result FROM deliveryInfo WHERE id = orderID LIMIT 1;
    RETURN result;
END /
DELIMITER ;
