using System;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Классический калькулятор на C#");
        double memory = 0.0;
        bool running = true;

        while (running)
        {
            Console.WriteLine("\nВыберите тип операции:");
            Console.WriteLine("1. Бинарная операция (+, -, *, /, %)");
            Console.WriteLine("2. Унарная операция (1/x, x^2, sqrt(x))");
            Console.WriteLine("3. ОпераMции с памятью (M+, M-, MR)");
            Console.WriteLine("4. Выход");
            Console.Write("Ваш выбор: ");

            string choice;
            do
            {
                choice = Console.ReadLine();
            } while (string.IsNullOrEmpty(choice));

            switch (choice)
            {
                case "1":
                    PerformBinaryOperation();
                    break;
                case "2":
                    PerformUnaryOperation();
                    break;
                case "3":
                    PerformMemoryOperation(ref memory);
                    break;
                case "4":
                    running = false;
                    Console.WriteLine("Выход из калькулятора.");
                    break;
                default:
                    Console.WriteLine("Неверный выбор. Попробуйте еще раз.");
                    break;
            }
        }
    }

    static void PerformBinaryOperation()
    {
        Console.Write("Введите первое число: ");
        double num1;
        if (!double.TryParse(Console.ReadLine(), out num1))
        {
            Console.WriteLine("Неверный ввод числа.");
            return;
        }

        Console.Write("Введите операцию (+, -, *, /, %): ");
        string operation = Console.ReadLine();

        Console.Write("Введите второе число: ");
        double num2;
        if (!double.TryParse(Console.ReadLine(), out num2))
        {
            Console.WriteLine("Неверный ввод числа.");
            return;
        }

        double result = 0;
        bool valid = true;

        switch (operation)
        {
            case "+":
                result = num1 + num2;
                break;
            case "-":
                result = num1 - num2;
                break;
            case "*":
                result = num1 * num2;
                break;
            case "/":
                if (num2 != 0)
                {
                    result = num1 / num2;
                }
                else
                {
                    Console.WriteLine("Ошибка: деление на ноль!");
                    valid = false;
                }
                break;
            case "%":
                if (num2 != 0)
                {
                    result = num1 % num2;
                }
                else
                {
                    Console.WriteLine("Ошибка: деление на ноль!");
                    valid = false;
                }
                break;
            default:
                Console.WriteLine("Неверная операция!");
                valid = false;
                break;
        }

        if (valid)
        {
            Console.WriteLine($"Результат: {num1} {operation} {num2} = {result}");
        }
    }

    static void PerformUnaryOperation()
    {
        Console.Write("Введите число: ");
        double num;
        if (!double.TryParse(Console.ReadLine(), out num))
        {
            Console.WriteLine("Неверный ввод числа.");
            return;
        }

        Console.Write("Введите операцию (1/x, x^2, sqrt(x)): ");
        string operation = Console.ReadLine();

        double result = 0;
        bool valid = true;

        switch (operation)
        {
            case "1/x":
                if (num != 0)
                {
                    result = 1.0 / num;
                }
                else
                {
                    Console.WriteLine("Ошибка: деление на ноль!");
                    valid = false;
                }
                break;
            case "x^2":
                result = num * num;
                break;
            case "sqrt(x)":
                if (num >= 0)
                {
                    result = Math.Sqrt(num);
                }
                else
                {
                    Console.WriteLine("Ошибка: отрицательное число под корнем!");
                    valid = false;
                }
                break;
            default:
                Console.WriteLine("Неверная операция!");
                valid = false;
                break;
        }

        if (valid)
        {
            Console.WriteLine($"Результат: {operation} ({num}) = {result}");
        }
    }

    static void PerformMemoryOperation(ref double memory)
    {
        Console.Write("Введите операцию с памятью (M+, M-, MR): ");
        string operation = Console.ReadLine();

        switch (operation)
        {
            case "M+":
                Console.Write("Введите число для добавления в память: ");
                double addValue;
                if (double.TryParse(Console.ReadLine(), out addValue))
                {
                    memory += addValue;
                    Console.WriteLine($"Память обновлена: {memory}");
                }
                else
                {
                    Console.WriteLine("Неверный ввод числа.");
                }
                break;
            case "M-":
                Console.Write("Введите число для вычитания из памяти: ");
                double subValue;
                if (double.TryParse(Console.ReadLine(), out subValue))
                {
                    memory -= subValue;
                    Console.WriteLine($"Память обновлена: {memory}");
                }
                else
                {
                    Console.WriteLine("Неверный ввод числа.");
                }
                break;
            case "MR":
                Console.WriteLine($"Значение в памяти: {memory}");
                break;
            default:
                Console.WriteLine("Неверная операция!");
                break;
        }
    }
}
