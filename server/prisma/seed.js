import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = ["Salary","Food","Rent","Transport","Shopping","Bills","Entertainment","Healthcare","Education","Investment","Insurance","Loan","Other"];

async function main() {
  await prisma.category.createMany({ data: categories.map(name => ({ name })), skipDuplicates: true });
  const cat = Object.fromEntries((await prisma.category.findMany()).map(c => [c.name, c.id]));

  const passwordHash = await bcrypt.hash("Demo@12345", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@financeai.com" },
    update: { fullName: "Demo User", passwordHash },
    create: { fullName: "Demo User", email: "demo@financeai.com", passwordHash }
  });

  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.budget.deleteMany({ where: { userId: user.id } });
  await prisma.goal.deleteMany({ where: { userId: user.id } });
  await prisma.account.deleteMany({ where: { userId: user.id } });

  const accounts = await Promise.all([
    prisma.account.create({ data: { userId: user.id, name: "Primary Bank", institution: "Demo Bank", type: "BANK", balance: 125000, currency: "INR", maskedNumber: "XXXX XXXX 1234", isConnected: true } }),
    prisma.account.create({ data: { userId: user.id, name: "Cash Wallet", institution: "Personal", type: "WALLET", balance: 8500, currency: "INR", maskedNumber: "WALLET", isConnected: false } }),
    prisma.account.create({ data: { userId: user.id, name: "Investment Account", institution: "Demo Investments", type: "INVESTMENT", balance: 210000, currency: "INR", maskedNumber: "XXXX XXXX 7788", isConnected: false } })
  ]);

  const expenseRows = [
    ["SWIGGY", "Food", 850], ["ZOMATO", "Food", 620], ["UBER", "Transport", 450],
    ["AMAZON", "Shopping", 2200], ["NETFLIX", "Entertainment", 649], ["ELECTRICITY BILL", "Bills", 3100],
    ["APOLLO PHARMACY", "Healthcare", 1200], ["ONLINE COURSE", "Education", 1800], ["HOUSE RENT", "Rent", 22000]
  ];

  const txs = [];
  for (let m = 0; m < 10; m++) {
    const base = new Date();
    base.setMonth(base.getMonth() - m);
    txs.push({
      userId: user.id, accountId: accounts[0].id, date: new Date(base.getFullYear(), base.getMonth(), 1),
      description: "SALARY CREDIT", amount: 85000, type: "INCOME", categoryId: cat.Salary, source: "seed"
    });
    for (const [description, category, amount] of expenseRows) {
      const d = new Date(base.getFullYear(), base.getMonth(), 3 + Math.floor(Math.random() * 20));
      txs.push({
        userId: user.id, accountId: accounts[0].id, date: d, description, amount: amount + Math.round(Math.random() * 500),
        type: "EXPENSE", categoryId: cat[category], source: "seed"
      });
    }
  }
  await prisma.transaction.createMany({ data: txs });

  const now = new Date();
  const month = new Date(now.getFullYear(), now.getMonth(), 1);
  const budget = await prisma.budget.create({ data: { userId: user.id, month } });
  await prisma.budgetCategory.createMany({
    data: [
      ["Food", 8000], ["Transport", 4000], ["Shopping", 5000],
      ["Entertainment", 2000], ["Bills", 6000], ["Healthcare", 3000]
    ].map(([name, amount]) => ({ budgetId: budget.id, categoryId: cat[name], amount }))
  });

  await prisma.goal.createMany({
    data: [
      { userId: user.id, name: "Emergency Fund", targetAmount: 300000, currentAmount: 125000, targetDate: new Date(now.getFullYear()+1, 5, 1), monthlyContribution: 18000 },
      { userId: user.id, name: "Vacation", targetAmount: 120000, currentAmount: 45000, targetDate: new Date(now.getFullYear(), 11, 15), monthlyContribution: 12500 },
      { userId: user.id, name: "New Phone", targetAmount: 60000, currentAmount: 15000, targetDate: new Date(now.getFullYear(), 8, 1), monthlyContribution: 7500 }
    ]
  });

  console.log("Seeded FinanceAI demo data for demo@financeai.com");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
