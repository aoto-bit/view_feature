function getShape(data) {
    let shape = [];
    while (Array.isArray(data)) {
        shape.push(data.length);
        data = data[0];
    }
    return shape;
}
