import * as mathjs from "mathjs";

function clampData(data, minValue, maxValue) {
    return data.map((row) =>
        row.map((value) => Math.min(Math.max(value, minValue), maxValue))
    );
}

/**
 * Calculates the covariance matrix of the given dataset.
 * The function computes the covariance between each pair of features in the dataset.
 *
 * Covariance measures the relationship between two variables. A positive covariance means the variables increase together,
 * while a negative covariance means one increases as the other decreases. Zero covariance indicates no relationship between the variables.
 *
 * This function assumes that the input data is a matrix, where each row represents an observation, and each column represents a feature.
 *
 * @param {Array} data - An array (matrix) of numerical values where each row is an observation and each column is a feature.
 *                       The dataset should have `n` observations and `m` features.
 *
 * @returns {Array} - The covariance matrix, which is an `m x m` matrix, where `m` is the number of features in the data.
 *                    Each element at position (i, j) represents the covariance between feature i and feature j.
 */
function covarianceData(data) {
    const numObservations = data.length;

    // TODO: Calculate the data multiplied by its transpose
    const multiplied = mathjs.multiply(mathjs.transpose(data), data);

    // TODO: Divide the multiplied data by the number of observations minus 1
    const covariance = mathjs.divide(multiplied, numObservations - 1);

    return covariance;
}

function eigenDecomposition(data) {
    return mathjs.eigs(data).eigenvectors;
}

/**
 * Retrieves the top eigenvectors based on the eigenvalues from the given eigenData.
 *
 * This function sorts the provided eigenData by the eigenvalues in descending order
 * and returns the top `numComponents` eigenvectors corresponding to the largest eigenvalues.
 * Eigenvectors represent the directions of maximum variance, and selecting the top
 * eigenvectors allows for dimensionality reduction and principal component analysis (PCA).
 *
 * @param {Array} eigenData - An array of objects where each object contains:
 *                             - `value` (number): the eigenvalue
 *                             - `vector` (Array): the eigenvector corresponding to the eigenvalue
 * @param {number} numComponents - The number of top eigenvectors to return based on the largest eigenvalues.
 *
 * @returns {Array} topEigenvectors - An array of the top `numComponents` eigenvectors,
 *                                     where each item is an eigenvector corresponding to
 *                                     the largest eigenvalues.
 */
function getTopEigenvectors(eigenData, numComponents) {
    // TODO: Sort the eigen array by eigen's element's value in descending order,
    // Note eigen's element's value may be NaN
    let eigen = [...eigenData];
    eigen.sort((a, b) => {
        // Handle NaN values - NaN should be sorted to the end
        if (isNaN(a.value)) return 1;
        if (isNaN(b.value)) return -1;
        // Sort in descending order
        return b.value - a.value;
    });

    // TODO: Return the top `numComponents` eigenvectors
    let topEigenvectors = eigen
        .slice(0, numComponents)
        .map((item) => item.vector);

    return topEigenvectors;
}

/**
 * Projects the given data onto the specified principal components.
 *
 * This function takes in a dataset and a matrix of principal components and projects
 * the data onto the new coordinate system defined by the principal components. The
 * resulting projected data is in the form of a reduced-dimensional representation.
 *
 * @param {Array} data - An array representing the dataset to be projected. Each row
 *                       represents a data point, and each column represents a feature.
 * @param {Array} principalComponents - An array where each column is a principal
 *                                       component vector. The number of columns should
 *                                       match the number of features in the data.
 *
 * @returns {Array} projected - An array representing the projected data in the new
 *                               coordinate system defined by the principal components.
 *                               Each row represents a projected data point, and each
 *                               column corresponds to a principal component.
 */
function projectData(data, principalComponents) {
    const transposed = mathjs.transpose(principalComponents);

    // TODO: Project the data onto the principal components, use transposed principal components
    const projected = mathjs.multiply(data, transposed);

    return projected;
}

function inverseProjectData(data, principalComponents) {
    return mathjs.multiply(data, principalComponents);
}

function reconstructData(data, pcaData) {
    const inverseProjected = inverseProjectData(
        data,
        pcaData.principalComponents
    );
    return mathjs.add(inverseProjected, pcaData.mean);
}

function performPCA(data, numComponents) {
    // TODO: Calculate the mean of the data
    const mean = mathjs.mean(data, 0);

    // TODO: Center the data by subtracting the mean from each observation
    const centered = data.map((row) =>
        row.map((value, colIndex) => value - mean[colIndex])
    );

    const covariance = covarianceData(centered);
    const eigen = eigenDecomposition(covariance);
    const principalComponents = getTopEigenvectors(eigen, numComponents);
    const projected = projectData(data, principalComponents);

    return {
        data,
        mean,
        centered,
        covariance,
        eigen,
        principalComponents,
        projected,
    };
}

export {
    performPCA,
    clampData,
    covarianceData,
    eigenDecomposition,
    getTopEigenvectors,
    projectData,
    inverseProjectData,
    reconstructData,
};
