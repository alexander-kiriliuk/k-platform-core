# Process module

This module allows you to run background processes in the system both manually and by schedule. A process is a class that inherits the abstract class `AbstractProcess`. The implementation of the logic that should be triggered when the process is started is implemented in the obligatory `execute()` method. It is also possible to perform any actions using the process life cycle callbacks by simply overloading them: `onFinish()`, `onStop()`, `onCrash()`. Also, it is possible to log the process using the `writeLog()` method. Logs are written to one container as part of a one run and assigned to the current process.

The process control interface looks like this:

![process-tmp.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/process-tmp.png)

The `ProcessUnitEntity` entity is responsible for process configuration, startup parameters, storing status, state and logs. When creating a process, it is important to note that the code in `ProcessUnitEntity` must match the name of your process class. For a process to be registered in the system, it is enough to define a `provider` with it.

This module also provides the ability to run a process programmatically from other modules you write. To do this, use the `ProcessManagerService` service and its corresponding methods. You can read [codebase documentation](https://alexander-kiriliuk.github.io/k-platform-core) for a detailed description of the module.

For an illustrative example, we can look at an embedded process [TmpDirCleanerProcess](https://github.com/alexander-kiriliuk/k-platform-core/blob/master/lib/common/process/default/tmp-dir-cleaner.process.ts). 

To demonstrate a practical example, let's create our own process whose task is to output the string `I'm alive` into the log. Create a class and define a provider for it:

    export class TestProcess extends AbstractProcess {

        constructor(
            @Inject(LOGGER) protected readonly logger: Logger,
            protected readonly pmService: ProcessManagerService,
        ) {
            super();
        }
        
        protected async execute() {
            await this.writeLog("I'm alive");
        }

    }

Create a configuration-entry that tells the system to run the process every 30 seconds:

    <InsertUpdate target="ProcessUnitEntity">
        <row>
            <code>TestProcess</code>
            <enabled>true</enabled>
            <cronTab>*/30 * * * * *</cronTab>
        </row>
    </InsertUpdate>

Let's start the server. Go to the `/object/process/TestProcess` process control, click the `Execute` button, we will see a record like this in the log:

    [8769 20.08.2024, 23:02:04 LOG] Process with id TestProcess was finished
    [8769 20.08.2024, 23:02:04 LOG] I'm alive
    [8769 20.08.2024, 23:02:04 LOG] Start process with id TestProcess

Waiting 30 seconds, we can see that our process is running on schedule:

![process-test.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/process-test.png)

