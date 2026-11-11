const prisma = require('../prisma');

// A user can see the global library (createdById = null) plus their own custom exercises.
const visibleTo = (userId) => ({
    OR: [{ createdById: null }, { createdById: userId }],
});

const buildListWhere = (userId, { search, muscle, category, equipment, mine }) => {
    const and = [mine ? { createdById: userId } : visibleTo(userId)];

    if (search) and.push({ name: { contains: search, mode: 'insensitive' } });
    if (muscle) {
        and.push({ OR: [{ primaryMuscle: muscle }, { secondaryMuscles: { has: muscle } }] });
    }
    if (category) and.push({ category });
    if (equipment) and.push({ equipment });

    return { AND: and };
};

const listExercises = async (userId, filters) => {
    const where = buildListWhere(userId, filters);
    const [items, total] = await prisma.$transaction([
        prisma.exercise.findMany({
            where,
            orderBy: { name: 'asc' },
            skip: (filters.page - 1) * filters.limit,
            take: filters.limit,
        }),
        prisma.exercise.count({ where }),
    ]);
    return { items, total };
};

const findVisibleExercise = (id, userId) =>
    prisma.exercise.findFirst({ where: { id, ...visibleTo(userId) } });

const createCustomExercise = (userId, data) =>
    prisma.exercise.create({
        data: { ...data, isCustom: true, createdById: userId },
    });

const updateExercise = (id, data) => prisma.exercise.update({ where: { id }, data });

const deleteExercise = (id) => prisma.exercise.delete({ where: { id } });

module.exports = {
    listExercises,
    findVisibleExercise,
    createCustomExercise,
    updateExercise,
    deleteExercise,
};
